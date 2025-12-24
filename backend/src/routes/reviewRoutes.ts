import express from "express";
import { body } from "express-validator";
import {
  createReview,
  getPostReviews,
  getUserReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController";
import { protect } from "../middleware/auth";

const router = express.Router();

const reviewValidation = [
  body("postId").notEmpty().withMessage("Post ID is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

router.get("/post/:postId", getPostReviews);
router.get("/user/:userId", getUserReviews);
router.post("/", protect, reviewValidation, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
