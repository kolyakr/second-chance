import express from "express";
import { body } from "express-validator";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getUserPosts,
  getTrendingPosts,
} from "../controllers/postController";
import { protect, optionalAuth } from "../middleware/auth";

const router = express.Router();

const postValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 }),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 2000 }),
  body("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("category")
    .isIn(["men", "women", "children", "accessories", "footwear"])
    .withMessage("Invalid category"),
  body("condition")
    .isIn(["new", "like-new", "used", "with-defects"])
    .withMessage("Invalid condition"),
];

router.get("/trending", getTrendingPosts);
router.get("/user/:userId", getUserPosts);
router.get("/:id", optionalAuth, getPost);
router.get("/", optionalAuth, getPosts);
router.post("/", protect, postValidation, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
