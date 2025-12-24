import express from "express";
import { protect } from "../middleware/auth";
import {
  generateDescription,
  analyzeImages,
  enhanceSearch,
} from "../controllers/geminiController";

const router = express.Router();

router.post("/generate-description", protect, generateDescription);
router.post("/analyze-images", protect, analyzeImages);
router.post("/enhance-search", enhanceSearch);

export default router;
