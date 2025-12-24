import express from "express";
import { body } from "express-validator";
import {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  reportComment,
} from "../controllers/commentController";
import { protect } from "../middleware/auth";

const router = express.Router();

const commentValidation = [
  body("postId").notEmpty().withMessage("Post ID is required"),
  body("content")
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ max: 1000 }),
];

router.get("/post/:postId", getPostComments);
router.post("/", protect, commentValidation, createComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/report", protect, reportComment);

export default router;
