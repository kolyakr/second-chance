import { Response } from "express";
import { validationResult } from "express-validator";
import Order from "../models/Order";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import Notification from "../models/Notification";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(
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

    const { postId, deliveryAddress } = req.body;

    // Validate that delivery is only to Ukraine
    if (
      deliveryAddress.country !== "Ukraine" &&
      deliveryAddress.country !== "Україна"
    ) {
      res.status(400).json({
        success: false,
        message: "Доставка доступна лише в Україну",
      });
      return;
    }

    // Get the post
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({
        success: false,
        message: "Оголошення не знайдено",
      });
      return;
    }

    // Check if post is available
    if (post.status !== "active") {
      res.status(400).json({
        success: false,
        message: "Цей товар більше недоступний",
      });
      return;
    }

    // Check if user is trying to buy their own item
    if (post.user.toString() === req.user!._id.toString()) {
      res.status(400).json({
        success: false,
        message: "Ви не можете купити свій власний товар",
      });
      return;
    }

    // Check if post has a price
    if (!post.price || post.price <= 0) {
      res.status(400).json({
        success: false,
        message: "Для цього товару не встановлено ціну",
      });
      return;
    }

    // Create order
    const order = await Order.create({
      post: postId,
      buyer: req.user!._id,
      seller: post.user,
      deliveryAddress,
      totalAmount: post.price,
      status: "pending",
      paymentStatus: "pending",
    });

    // Create notification for seller
    await Notification.create({
      user: post.user,
      type: "message",
      content: `Отримано нове замовлення для "${post.title}"`,
      relatedUser: req.user!._id,
      relatedPost: post._id,
    });

    // Update post status to sold (optional - you might want to keep it active for multiple orders)
    // await Post.findByIdAndUpdate(postId, { status: "sold" });

    res.status(201).json({
      success: true,
      data: order,
      message: "Замовлення успішно створено",
    });
  }
);

// @desc    Get user's orders (as buyer)
// @route   GET /api/orders
// @access  Private
export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = { buyer: req.user!._id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("post", "title images price")
      .populate("seller", "username avatar")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  }
);

// @desc    Get orders received (as seller)
// @route   GET /api/orders/seller
// @access  Private
export const getSellerOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = { seller: req.user!._id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("post", "title images price")
      .populate("buyer", "username avatar email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  }
);

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id)
      .populate("post")
      .populate("buyer", "username avatar email")
      .populate("seller", "username avatar email");

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Замовлення не знайдено",
      });
      return;
    }

    // Check if user is buyer or seller
    const isBuyer = order.buyer._id.toString() === req.user!._id.toString();
    const isSeller = order.seller._id.toString() === req.user!._id.toString();

    if (!isBuyer && !isSeller) {
      res.status(403).json({
        success: false,
        message: "Не маєте права переглядати це замовлення",
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  }
);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Невірний статус",
      });
      return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Замовлення не знайдено",
      });
      return;
    }

    // Only seller or admin can update status
    const isSeller = order.seller.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === "admin";

    if (!isSeller && !isAdmin) {
      res.status(403).json({
        success: false,
        message: "Тільки продавець або адміністратор може оновлювати статус замовлення",
      });
      return;
    }

    order.status = status;
    await order.save();

    // Populate post to get title for notification
    await order.populate("post", "title");

    // Create notification for buyer
    await Notification.create({
      user: order.buyer,
      type: "message",
      content: `Статус замовлення оновлено до "${status}" для "${
        (order.post as any).title
      }"`,
      relatedUser: req.user!._id,
      relatedPost: order.post,
    });

    res.json({
      success: true,
      data: order,
      message: "Статус замовлення успішно оновлено",
    });
  }
);

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Замовлення не знайдено",
      });
      return;
    }

    // Check if user is buyer or seller
    const isBuyer = order.buyer.toString() === req.user!._id.toString();
    const isSeller = order.seller.toString() === req.user!._id.toString();

    if (!isBuyer && !isSeller) {
      res.status(403).json({
        success: false,
        message: "Не маєте права скасовувати це замовлення",
      });
      return;
    }

    // Can only cancel pending or confirmed orders
    if (!["pending", "confirmed"].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: "Неможливо скасувати замовлення в поточному статусі",
      });
      return;
    }

    order.status = "cancelled";
    await order.save();

    // Populate post to get title for notification
    await order.populate("post", "title");

    // Create notification
    const notifyUser = isBuyer ? order.seller : order.buyer;
    await Notification.create({
      user: notifyUser,
      type: "message",
      content: `Замовлення скасовано для "${(order.post as any).title}"`,
      relatedUser: req.user!._id,
      relatedPost: order.post,
    });

    res.json({
      success: true,
      data: order,
      message: "Замовлення успішно скасовано",
    });
  }
);
