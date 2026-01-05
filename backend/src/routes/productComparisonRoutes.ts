import express from "express";
import {
  addToComparison,
  removeFromComparison,
  getComparison,
  clearComparison,
} from "../controllers/productComparisonController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/", protect, addToComparison);
router.delete("/:postId", protect, removeFromComparison);
router.get("/", protect, getComparison);
router.delete("/", protect, clearComparison);

export default router;

