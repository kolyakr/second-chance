import express from "express";
import {
  toggleLike,
  getUserLikes,
  checkLike,
} from "../controllers/likeController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/user", protect, getUserLikes);
router.get("/:postId", protect, checkLike);
router.post("/:postId", protect, toggleLike);

export default router;
