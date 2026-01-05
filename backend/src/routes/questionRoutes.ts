import express from "express";
import { body } from "express-validator";
import {
  createQuestion,
  getPostQuestions,
  answerQuestion,
  deleteQuestion,
} from "../controllers/questionController";
import { protect, optionalAuth } from "../middleware/auth";

const router = express.Router();

const questionValidation = [
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ max: 500 })
    .withMessage("Content must be less than 500 characters"),
];

router.post("/", protect, questionValidation, createQuestion);
router.get("/post/:postId", optionalAuth, getPostQuestions);
router.put("/:id/answer", protect, answerQuestion);
router.delete("/:id", protect, deleteQuestion);

export default router;

