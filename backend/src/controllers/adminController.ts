import { Response } from "express";
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const [
      totalUsers,
      totalPosts,
      activePosts,
      totalComments,
      usersByRole,
      postsByCategory,
      postsByCondition,
      recentUsers,
      recentPosts,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: "active" }),
      Comment.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Post.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Post.aggregate([{ $group: { _id: "$condition", count: { $sum: 1 } } }]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("username email createdAt"),
      Post.find()
        .populate("user", "username")
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title category createdAt"),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPosts,
          activePosts,
          totalComments,
        },
        usersByRole,
        postsByCategory,
        postsByCondition,
        recentUsers,
        recentPosts,
      },
    });
  }
);

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, role, search } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: new RegExp(search as string, "i") },
        { email: new RegExp(search as string, "i") },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: users,
    });
  }
);

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
export const toggleBanUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.role === "admin") {
      res
        .status(400)
        .json({ success: false, message: "Cannot ban admin users" });
      return;
    }

    // For simplicity, we'll use a custom field or repurpose existing fields
    // In a real app, you'd have an 'isBanned' field
    // For now, we'll just return a message
    res.json({
      success: true,
      message: "User ban status updated (implement ban field in User model)",
    });
  }
);

// @desc    Delete post (admin)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
export const deletePostAdmin = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: "Post deleted by admin",
    });
  }
);

// @desc    Get reported comments
// @route   GET /api/admin/comments/reported
// @access  Private/Admin
export const getReportedComments = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const comments = await Comment.find({ isReported: true })
      .populate("user", "username")
      .populate("post", "title")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: comments.length,
      data: comments,
    });
  }
);

// @desc    Delete comment (admin)
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
export const deleteCommentAdmin = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }

    // Update post comments count
    const post = await Post.findById(comment.post);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted by admin",
    });
  }
);
