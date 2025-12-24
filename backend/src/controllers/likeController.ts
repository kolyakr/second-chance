import { Response } from "express";
import Like from "../models/Like";
import Post from "../models/Post";
import Notification from "../models/Notification";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Toggle like on post
// @route   POST /api/likes/:postId
// @access  Private
export const toggleLike = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      res
        .status(404)
        .json({ success: false, message: "Оголошення не знайдено" });
      return;
    }

    const existingLike = await Like.findOne({
      user: req.user!._id,
      post: postId,
    });

    if (existingLike) {
      // Unlike
      await existingLike.deleteOne();
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();

      res.json({
        success: true,
        liked: false,
        message: "Вподобання видалено",
      });
    } else {
      // Like
      await Like.create({
        user: req.user!._id,
        post: postId,
      });
      post.likesCount += 1;
      await post.save();

      // Create notification for post owner (if not liking own post)
      if (post.user.toString() !== req.user!._id.toString()) {
        await Notification.create({
          user: post.user,
          type: "like",
          relatedUser: req.user!._id,
          relatedPost: post._id,
          content: `${req.user!.username} liked your post`,
        });
      }

      res.json({
        success: true,
        liked: true,
        message: "Оголошення вподобано",
      });
    }
  }
);

// @desc    Get user's liked posts
// @route   GET /api/likes/user
// @access  Private
export const getUserLikes = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const likes = await Like.find({ user: req.user!._id })
      .populate({
        path: "post",
        populate: {
          path: "user",
          select: "username avatar",
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: likes.length,
      data: likes,
    });
  }
);

// @desc    Check if user liked a post
// @route   GET /api/likes/:postId
// @access  Private
export const checkLike = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const like = await Like.findOne({
      user: req.user!._id,
      post: req.params.postId,
    });

    res.json({
      success: true,
      liked: !!like,
    });
  }
);
