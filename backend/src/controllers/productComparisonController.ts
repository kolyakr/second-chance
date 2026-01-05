import { Response } from "express";
import ProductComparison from "../models/ProductComparison";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Add post to comparison
// @route   POST /api/comparison
// @access  Private
export const addToComparison = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Оголошення не знайдено" });
      return;
    }

    let comparison = await ProductComparison.findOne({ user: req.user!._id });

    if (!comparison) {
      comparison = await ProductComparison.create({
        user: req.user!._id,
        posts: [postId],
      });
    } else {
      // Check if post already in comparison
      if (comparison.posts.some((p) => p.toString() === postId)) {
        res.status(400).json({
          success: false,
          message: "Товар вже в порівнянні",
        });
        return;
      }

      // Check if limit reached
      if (comparison.posts.length >= 4) {
        res.status(400).json({
          success: false,
          message: "Максимум 4 товари в порівнянні",
        });
        return;
      }

      comparison.posts.push(postId);
      await comparison.save();
    }

    res.json({
      success: true,
      data: comparison,
    });
  }
);

// @desc    Remove post from comparison
// @route   DELETE /api/comparison/:postId
// @access  Private
export const removeFromComparison = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const comparison = await ProductComparison.findOne({ user: req.user!._id });

    if (!comparison) {
      res.status(404).json({
        success: false,
        message: "Порівняння не знайдено",
      });
      return;
    }

    comparison.posts = comparison.posts.filter(
      (p) => p.toString() !== req.params.postId
    );

    if (comparison.posts.length === 0) {
      await comparison.deleteOne();
      res.json({
        success: true,
        message: "Порівняння видалено",
        data: null,
      });
    } else {
      await comparison.save();
      res.json({
        success: true,
        message: "Товар видалено з порівняння",
        data: comparison,
      });
    }
  }
);

// @desc    Get user's comparison
// @route   GET /api/comparison
// @access  Private
export const getComparison = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const comparison = await ProductComparison.findOne({ user: req.user!._id })
      .populate({
        path: "posts",
        populate: {
          path: "user",
          select: "username avatar",
        },
      });

    if (!comparison) {
      res.json({
        success: true,
        data: { posts: [] },
      });
      return;
    }

    res.json({
      success: true,
      data: comparison,
    });
  }
);

// @desc    Clear comparison
// @route   DELETE /api/comparison
// @access  Private
export const clearComparison = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await ProductComparison.findOneAndDelete({ user: req.user!._id });

    res.json({
      success: true,
      message: "Порівняння очищено",
    });
  }
);

