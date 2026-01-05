import { Response } from "express";
import ViewHistory from "../models/ViewHistory";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Add post to view history
// @route   POST /api/view-history
// @access  Private
export const addToViewHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Оголошення не знайдено" });
      return;
    }

    // Update or create view history entry
    await ViewHistory.findOneAndUpdate(
      { user: req.user!._id, post: postId },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "Додано до історії перегляду",
    });
  }
);

// @desc    Get user's view history
// @route   GET /api/view-history
// @access  Private
export const getViewHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 20 } = req.query;

    const viewHistory = await ViewHistory.find({ user: req.user!._id })
      .populate({
        path: "post",
        populate: {
          path: "user",
          select: "username avatar",
        },
      })
      .sort({ viewedAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: viewHistory.length,
      data: viewHistory,
    });
  }
);

// @desc    Clear view history
// @route   DELETE /api/view-history
// @access  Private
export const clearViewHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await ViewHistory.deleteMany({ user: req.user!._id });

    res.json({
      success: true,
      message: "Історія перегляду очищена",
    });
  }
);

