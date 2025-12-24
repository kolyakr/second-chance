import { Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/User";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.params.id)
      .select(
        "-password -emailVerificationToken -passwordResetToken -passwordResetExpires"
      )
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!user) {
      res.status(404).json({ success: false, message: "Користувача не знайдено" });
      return;
    }

    // Get user stats
    const postsCount = await Post.countDocuments({
      user: user._id,
      status: "active",
    });
    const followersCount = user.followers.length;
    const followingCount = user.following.length;

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      if (currentUser) {
        isFollowing = currentUser.following.some(
          (id) => id.toString() === user._id.toString()
        );
      }
    }

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          postsCount,
          followersCount,
          followingCount,
        },
        isFollowing,
      },
    });
  }
);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { firstName, lastName, bio, location, avatar, telegram, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      {
        firstName,
        lastName,
        bio,
        location,
        avatar,
        telegram,
        phone,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    res.json({
      success: true,
      data: user,
    });
  }
);

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
export const toggleFollow = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const targetUserId = req.params.id;
    const currentUserId = req.user!._id;

    if (targetUserId === currentUserId.toString()) {
      res
        .status(400)
        .json({ success: false, message: "Ви не можете підписатися на себе" });
      return;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      res.status(404).json({ success: false, message: "Користувача не знайдено" });
      return;
    }

    const currentUser = await User.findById(currentUserId);

    const isFollowing = currentUser!.following.some(
      (id) => id.toString() === targetUserId
    );

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId },
      });

      res.json({
        success: true,
        following: false,
        message: "Відписка виконана",
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, {
        $push: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $push: { followers: currentUserId },
      });

      res.json({
        success: true,
        following: true,
        message: "Підписка виконана",
      });
    }
  }
);

// @desc    Get user's saved posts
// @route   GET /api/users/saved
// @access  Private
export const getSavedPosts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user!._id).populate({
      path: "savedPosts",
      populate: {
        path: "user",
        select: "username avatar",
      },
    });

    res.json({
      success: true,
      count: user!.savedPosts.length,
      data: user!.savedPosts,
    });
  }
);

// @desc    Save/Unsave post
// @route   POST /api/users/save/:postId
// @access  Private
export const toggleSavePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.user!._id;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Оголошення не знайдено" });
      return;
    }

    const user = await User.findById(userId);
    const isSaved = user!.savedPosts.some((id) => id.toString() === postId);

    if (isSaved) {
      // Unsave
      await User.findByIdAndUpdate(userId, {
        $pull: { savedPosts: postId },
      });

      res.json({
        success: true,
        saved: false,
        message: "Оголошення видалено зі збережених",
      });
    } else {
      // Save
      await User.findByIdAndUpdate(userId, {
        $push: { savedPosts: postId },
      });

      res.json({
        success: true,
        saved: true,
        message: "Оголошення збережено",
      });
    }
  }
);

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
export const getDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id;

    const [posts, savedPosts, followers, following] = await Promise.all([
      Post.find({ user: userId })
        .populate("user", "username avatar")
        .sort({ createdAt: -1 })
        .limit(10),
      User.findById(userId)
        .select("savedPosts")
        .populate({
          path: "savedPosts",
          populate: { path: "user", select: "username avatar" },
        }),
      User.findById(userId)
        .select("followers")
        .populate("followers", "username avatar"),
      User.findById(userId)
        .select("following")
        .populate("following", "username avatar"),
    ]);

    res.json({
      success: true,
      data: {
        recentPosts: posts,
        savedPosts: savedPosts!.savedPosts,
        followers: followers!.followers,
        following: following!.following,
      },
    });
  }
);
