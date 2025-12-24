import { Response } from "express";
import { validationResult } from "express-validator";
import Review from "../models/Review";
import Post from "../models/Post";
import Order from "../models/Order";
import Notification from "../models/Notification";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { postId, rating, comment } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Оголошення не знайдено" });
      return;
    }

    // Check if user already reviewed this post
    const existingReview = await Review.findOne({
      user: req.user!._id,
      post: postId,
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        message: "Ви вже залишили відгук на це оголошення",
      });
      return;
    }

    // Can't review own post
    if (post.user.toString() === req.user!._id.toString()) {
      res
        .status(400)
        .json({ success: false, message: "Ви не можете залишити відгук на своє оголошення" });
      return;
    }

    // Check if user has purchased and received this item
    const deliveredOrder = await Order.findOne({
      post: postId,
      buyer: req.user!._id,
      status: "delivered",
    });

    if (!deliveredOrder) {
      res.status(400).json({
        success: false,
        message: "Ви можете залишити відгук лише на товари, які купили та отримали",
      });
      return;
    }

    const review = await Review.create({
      user: req.user!._id,
      post: postId,
      postOwner: post.user,
      rating,
      comment,
    });

    // Create notification
    await Notification.create({
      user: post.user,
      type: "review",
      relatedUser: req.user!._id,
      relatedPost: post._id,
      content: `${
        req.user!.username
      } left a ${rating}-star review on your post`,
    });

    await review.populate("user", "username avatar");

    res.status(201).json({
      success: true,
      data: review,
    });
  }
);

// @desc    Get reviews for a post
// @route   GET /api/reviews/post/:postId
// @access  Public
export const getPostReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const reviews = await Review.find({ post: req.params.postId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  }
);

// @desc    Get reviews for a user (as post owner)
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getUserReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const reviews = await Review.find({ postOwner: req.params.userId })
      .populate("user", "username avatar")
      .populate("post", "title")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    res.json({
      success: true,
      count: reviews.length,
      averageRating: avgRating.toFixed(1),
      data: reviews,
    });
  }
);

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ success: false, message: "Відгук не знайдено" });
      return;
    }

    if (review.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Не маєте права оновлювати цей відгук",
      });
      return;
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    res.json({
      success: true,
      data: review,
    });
  }
);

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ success: false, message: "Відгук не знайдено" });
      return;
    }

    if (
      review.user.toString() !== req.user!._id.toString() &&
      req.user!.role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Не маєте права видаляти цей відгук",
      });
      return;
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: "Відгук успішно видалено",
    });
  }
);
