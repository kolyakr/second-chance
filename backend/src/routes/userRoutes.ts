import express from "express";
import { body } from "express-validator";
import {
  getUserProfile,
  updateProfile,
  toggleFollow,
  getSavedPosts,
  toggleSavePost,
  getDashboard,
} from "../controllers/userController";
import { protect, optionalAuth } from "../middleware/auth";

const router = express.Router();

const profileValidation = [
  body("firstName").optional().isLength({ max: 50 }),
  body("lastName").optional().isLength({ max: 50 }),
  body("bio").optional().isLength({ max: 500 }),
  body("location").optional().isLength({ max: 100 }),
];

router.get("/dashboard", protect, getDashboard);
router.get("/saved", protect, getSavedPosts);
router.post("/save/:postId", protect, toggleSavePost);
router.get("/:id", optionalAuth, getUserProfile);
router.put("/profile", protect, profileValidation, updateProfile);
router.post("/:id/follow", protect, toggleFollow);

export default router;
