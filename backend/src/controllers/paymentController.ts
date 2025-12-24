import { Response } from "express";
import { validationResult } from "express-validator";
import { getStripe } from "../config/stripe";
import Order from "../models/Order";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import Notification from "../models/Notification";

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Помилка валідації",
        errors: errors.array(),
      });
      return;
    }

    const { orderId } = req.body;

    // Get the order
    const order = await Order.findById(orderId).populate("post");
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Замовлення не знайдено",
      });
      return;
    }

    // Verify the order belongs to the user
    if (order.buyer.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Не маєте права оплачувати це замовлення",
      });
      return;
    }

    // Check if order is already paid
    if (order.paymentStatus === "paid") {
      res.status(400).json({
        success: false,
        message: "Замовлення вже оплачено",
      });
      return;
    }

    // Check if order is cancelled
    if (order.status === "cancelled") {
      res.status(400).json({
        success: false,
        message: "Неможливо оплатити скасоване замовлення",
      });
      return;
    }

    // Create payment intent
    const stripe = getStripe();

    // Get post ID - handle both ObjectId and populated object
    let postId: string;
    if (
      typeof order.post === "object" &&
      order.post !== null &&
      "_id" in order.post
    ) {
      postId = (order.post as any)._id.toString();
    } else {
      postId = String(order.post);
    }

    // Get post title for metadata (truncate if too long)
    let postTitle = "Item";
    if (
      typeof order.post === "object" &&
      order.post !== null &&
      "title" in order.post
    ) {
      postTitle = (order.post as any).title || "Item";
    }
    const truncatedTitle =
      postTitle.length > 100 ? postTitle.substring(0, 97) + "..." : postTitle;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        orderId: order._id.toString(),
        buyerId: order.buyer.toString(),
        sellerId: order.seller.toString(),
        postId: postId,
        postTitle: truncatedTitle,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  }
);

// @desc    Confirm payment (after Stripe payment succeeds)
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Помилка валідації",
        errors: errors.array(),
      });
      return;
    }

    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      res.status(404).json({
        success: false,
        message: "Намір оплати не знайдено",
      });
      return;
    }

    // Get the order
    const order = await Order.findOne({ paymentIntentId });
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Замовлення не знайдено",
      });
      return;
    }

    // Verify the order belongs to the user
    if (order.buyer.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Не авторизовано",
      });
      return;
    }

    // Check payment status
    if (paymentIntent.status === "succeeded") {
      // Update order payment status
      order.paymentStatus = "paid";
      if (order.status === "pending") {
        order.status = "confirmed";
      }
      await order.save();

      // Create notification for seller
      await Notification.create({
        user: order.seller,
        type: "message",
        content: `Payment received for order "${(order.post as any).title}"`,
        relatedUser: req.user!._id,
        relatedPost: order.post,
      });

      res.json({
        success: true,
        data: order,
        message: "Платіж успішно підтверджено",
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment status: ${paymentIntent.status}`,
      });
    }
  }
);

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe calls this)
export const handleWebhook = asyncHandler(async (req: any, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    res.status(500).json({
      success: false,
      message: "Секрет webhook не налаштовано",
    });
    return;
  }

  let event;

  try {
    // req.body is already raw buffer from express.raw() middleware
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body as any,
      sig,
      webhookSecret
    ) as any;
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const order = await Order.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (order) {
        order.paymentStatus = "paid";
        if (order.status === "pending") {
          order.status = "confirmed";
        }
        await order.save();

        // Create notification for seller
        await Notification.create({
          user: order.seller,
          type: "message",
          content: `Payment received for order`,
          relatedUser: order.buyer,
          relatedPost: order.post,
        });
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      const failedOrder = await Order.findOne({
        paymentIntentId: failedPayment.id,
      });

      if (failedOrder) {
        // Optionally update order status or send notification
        await Notification.create({
          user: failedOrder.buyer,
          type: "message",
          content: `Платіж не вдався для замовлення`,
          relatedPost: failedOrder.post,
        });
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
