import { Response } from "express";
import Wishlist from "../models/Wishlist";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Add post to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Оголошення не знайдено" });
      return;
    }

    const existingWishlist = await Wishlist.findOne({
      user: req.user!._id,
      post: postId,
    });

    if (existingWishlist) {
      res.status(400).json({
        success: false,
        message: "Товар вже в списку бажань",
      });
      return;
    }

    const wishlist = await Wishlist.create({
      user: req.user!._id,
      post: postId,
    });

    res.status(201).json({
      success: true,
      data: wishlist,
    });
  }
);

// @desc    Remove post from wishlist
// @route   DELETE /api/wishlist/:postId
// @access  Private
export const removeFromWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const wishlist = await Wishlist.findOneAndDelete({
      user: req.user!._id,
      post: req.params.postId,
    });

    if (!wishlist) {
      res.status(404).json({
        success: false,
        message: "Товар не знайдено в списку бажань",
      });
      return;
    }

    res.json({
      success: true,
      message: "Товар видалено зі списку бажань",
    });
  }
);

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const wishlist = await Wishlist.find({ user: req.user!._id })
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
      count: wishlist.length,
      data: wishlist,
    });
  }
);

// @desc    Check if post is in wishlist
// @route   GET /api/wishlist/check/:postId
// @access  Private
export const checkWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const wishlist = await Wishlist.findOne({
      user: req.user!._id,
      post: req.params.postId,
    });

    res.json({
      success: true,
      isInWishlist: !!wishlist,
    });
  }
);

