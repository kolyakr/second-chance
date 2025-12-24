import express from "express";
import { body } from "express-validator";
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController";
import { protect } from "../middleware/auth";

const router = express.Router();

const orderValidation = [
  body("postId")
    .notEmpty()
    .withMessage("Post ID is required")
    .isMongoId()
    .withMessage("Invalid post ID"),
  body("deliveryAddress.fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("deliveryAddress.email")
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("deliveryAddress.phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10 })
    .withMessage("Phone number must be at least 10 characters"),
  body("deliveryAddress.address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters"),
  body("deliveryAddress.city")
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("City must be between 2 and 100 characters"),
  body("deliveryAddress.state")
    .notEmpty()
    .withMessage("State/Province is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("State/Province must be between 2 and 100 characters"),
  body("deliveryAddress.zipCode")
    .notEmpty()
    .withMessage("ZIP/Postal code is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("ZIP/Postal code must be between 3 and 20 characters"),
  body("deliveryAddress.country")
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ max: 100 })
    .withMessage("Country must be less than 100 characters"),
];

const statusValidation = [
  body("status")
    .isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid status"),
];

// All routes require authentication
router.use(protect);

router.post("/", orderValidation, createOrder);
router.get("/", getMyOrders);
router.get("/seller", getSellerOrders);
router.get("/:id", getOrder);
router.put("/:id/status", statusValidation, updateOrderStatus);
router.put("/:id/cancel", cancelOrder);

export default router;
