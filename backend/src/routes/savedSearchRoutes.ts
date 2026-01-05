import express from "express";
import {
  createSavedSearch,
  getSavedSearches,
  deleteSavedSearch,
} from "../controllers/savedSearchController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/", protect, createSavedSearch);
router.get("/", protect, getSavedSearches);
router.delete("/:id", protect, deleteSavedSearch);

export default router;

