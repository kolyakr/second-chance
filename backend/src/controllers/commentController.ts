import { Response } from "express";
import { validationResult } from "express-validator";
import Comment from "../models/Comment";
import Post from "../models/Post";
import Notification from "../models/Notification";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
export const getPostComments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;

    const comments = await Comment.find({
      post: postId,
      parentComment: null, // Only top-level comments
    })
      .populate("user", "username avatar")
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "username avatar",
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: comments.length,
      data: comments,
    });
  }
);

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
export const createComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { postId, content, parentCommentId } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Оголошення не знайдено" });
      return;
    }

    const commentData: any = {
      user: req.user!._id,
      post: postId,
      content,
    };

    if (parentCommentId) {
      commentData.parentComment = parentCommentId;
      // Add to parent comment's replies
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: null }, // Will be set after creation
      });
    }

    const comment = await Comment.create(commentData);

    // Update parent comment's replies if it's a reply
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id },
      });
    }

    // Update post comments count
    post.commentsCount += 1;
    await post.save();

    // Create notification for post owner (if not commenting on own post)
    if (post.user.toString() !== req.user!._id.toString()) {
      await Notification.create({
        user: post.user,
        type: "comment",
        relatedUser: req.user!._id,
        relatedPost: post._id,
        relatedComment: comment._id,
        content: `${req.user!.username} прокоментував ваше оголошення`,
      });
    }

    await comment.populate("user", "username avatar");

    res.status(201).json({
      success: true,
      data: comment,
    });
  }
);

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({ success: false, message: "Коментар не знайдено" });
      return;
    }

    // Make sure user is comment owner
    if (comment.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Не маєте права оновлювати цей коментар",
      });
      return;
    }

    comment.content = req.body.content;
    await comment.save();

    res.json({
      success: true,
      data: comment,
    });
  }
);

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({ success: false, message: "Коментар не знайдено" });
      return;
    }

    // Make sure user is comment owner or admin
    if (
      comment.user.toString() !== req.user!._id.toString() &&
      req.user!.role !== "admin" &&
      req.user!.role !== "moderator"
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
      return;
    }

    // Update post comments count
    const post = await Post.findById(comment.post);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

    // Remove from parent comment's replies if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  }
);

// @desc    Report comment
// @route   POST /api/comments/:id/report
// @access  Private
export const reportComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({ success: false, message: "Коментар не знайдено" });
      return;
    }

    // Check if already reported by this user
    if (comment.reports.includes(req.user!._id)) {
      res
        .status(400)
        .json({ success: false, message: "Comment already reported" });
      return;
    }

    comment.reports.push(req.user!._id);
    if (comment.reports.length >= 3) {
      comment.isReported = true;
    }
    await comment.save();

    res.json({
      success: true,
      message: "Comment reported successfully",
    });
  }
);
