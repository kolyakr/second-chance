import { Response } from "express";
import { validationResult } from "express-validator";
import Post from "../models/Post";
import Like from "../models/Like";
import ViewHistory from "../models/ViewHistory";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      category,
      condition,
      minPrice,
      maxPrice,
      color,
      season,
      size,
      brand,
      search,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter object
    const filter: any = { status: "active", isPublic: true };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (color) filter.color = color;
    if (size) filter.size = size;
    if (brand) filter.brand = new RegExp(brand as string, "i");
    if (season) {
      filter.season = Array.isArray(season) ? { $in: season } : season;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search as string, "i") },
        { description: new RegExp(search as string, "i") },
        { tags: new RegExp(search as string, "i") },
      ];
    }

    // Sort options
    const sortOptions: any = {};
    if (sortBy === "popularity") {
      sortOptions.likesCount = order === "desc" ? -1 : 1;
      sortOptions.commentsCount = order === "desc" ? -1 : 1;
      sortOptions.views = order === "desc" ? -1 : 1;
    } else {
      sortOptions[sortBy as string] = order === "desc" ? -1 : 1;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await Post.find(filter)
      .populate("user", "username avatar firstName lastName")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Post.countDocuments(filter);

    // Check if user liked each post
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        let isLiked = false;
        if (req.user) {
          const like = await Like.findOne({
            user: req.user._id,
            post: post._id,
          });
          isLiked = !!like;
        }
        return { ...post.toObject(), isLiked };
      })
    );

    res.json({
      success: true,
      count: posts.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: postsWithLikes,
    });
  }
);

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await Post.findById(req.params.id)
    .populate("user", "username avatar firstName lastName location bio")
    .populate({
      path: "user",
      populate: {
        path: "followers",
        select: "username",
      },
    });

  if (!post) {
    res.status(404).json({ success: false, message: "Оголошення не знайдено" });
    return;
  }

  // Increment views
  post.views += 1;
  await post.save();

  // Add to view history if user is authenticated
  if (req.user) {
    await ViewHistory.findOneAndUpdate(
      { user: req.user._id, post: post._id },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );
  }

  // Check if user liked this post
  let isLiked = false;
  if (req.user) {
    const like = await Like.findOne({
      user: req.user._id,
      post: post._id,
    });
    isLiked = !!like;
  }

  res.json({
    success: true,
    data: { ...post.toObject(), isLiked },
  });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    // Add user to req.body
    req.body.user = req.user!._id;

    const post = await Post.create(req.body);

    res.status(201).json({
      success: true,
      data: post,
    });
  }
);

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    let post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ success: false, message: "Оголошення не знайдено" });
      return;
    }

    // Make sure user is post owner or admin
    if (
      post.user.toString() !== req.user!._id.toString() &&
      req.user!.role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Не маєте права оновлювати це оголошення",
      });
      return;
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: post,
    });
  }
);

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ success: false, message: "Оголошення не знайдено" });
      return;
    }

    // Make sure user is post owner or admin
    if (
      post.user.toString() !== req.user!._id.toString() &&
      req.user!.role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Не маєте права видаляти це оголошення",
      });
      return;
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: "Оголошення успішно видалено",
    });
  }
);

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
export const getUserPosts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const posts = await Post.find({
      user: req.params.userId,
      status: "active",
    })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  }
);

// @desc    Get trending posts
// @route   GET /api/posts/trending
// @access  Public
export const getTrendingPosts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 10 } = req.query;

    const posts = await Post.find({ status: "active", isPublic: true })
      .populate("user", "username avatar")
      .sort({ likesCount: -1, commentsCount: -1, views: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  }
);
