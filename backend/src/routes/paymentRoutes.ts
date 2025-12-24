import express from "express";
import { body } from "express-validator";
import {
  createPaymentIntent,
  confirmPayment,
} from "../controllers/paymentController";
import { protect } from "../middleware/auth";

const router = express.Router();

const paymentIntentValidation = [
  body("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID"),
];

const confirmPaymentValidation = [
  body("paymentIntentId")
    .notEmpty()
    .withMessage("Payment intent ID is required"),
];

// Protected routes
router.post(
  "/create-intent",
  protect,
  paymentIntentValidation,
  createPaymentIntent
);
router.post("/confirm", protect, confirmPaymentValidation, confirmPayment);

// Note: Webhook route is handled directly in server.ts with raw body parser

export default router;
