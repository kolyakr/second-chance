import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlist,
} from "../controllers/wishlistController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/", protect, addToWishlist);
router.delete("/:postId", protect, removeFromWishlist);
router.get("/", protect, getWishlist);
router.get("/check/:postId", protect, checkWishlist);

export default router;

