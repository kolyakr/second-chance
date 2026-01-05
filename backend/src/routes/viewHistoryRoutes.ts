import express from "express";
import {
  addToViewHistory,
  getViewHistory,
  clearViewHistory,
} from "../controllers/viewHistoryController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/", protect, addToViewHistory);
router.get("/", protect, getViewHistory);
router.delete("/", protect, clearViewHistory);

export default router;

