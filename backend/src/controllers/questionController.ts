import { Response } from "express";
import { validationResult } from "express-validator";
import Question from "../models/Question";
import Post from "../models/Post";
import Notification from "../models/Notification";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Create question
// @route   POST /api/questions
// @access  Private
export const createQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { postId, content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Оголошення не знайдено" });
      return;
    }

    const question = await Question.create({
      user: req.user!._id,
      post: postId,
      content,
    });

    // Notify post owner
    if (post.user.toString() !== req.user!._id.toString()) {
      await Notification.create({
        user: post.user,
        type: "question",
        content: `Нове питання на ваше оголошення "${post.title}"`,
        relatedPost: postId,
        relatedUser: req.user!._id,
      });
    }

    res.status(201).json({
      success: true,
      data: await question.populate("user", "username avatar"),
    });
  }
);

// @desc    Get questions for a post
// @route   GET /api/questions/post/:postId
// @access  Public
export const getPostQuestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const questions = await Question.find({ post: req.params.postId })
      .populate("user", "username avatar")
      .populate("answeredBy", "username avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  }
);

// @desc    Answer question
// @route   PUT /api/questions/:id/answer
// @access  Private
export const answerQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { answer } = req.body;

    const question = await Question.findById(req.params.id).populate("post");

    if (!question) {
      res.status(404).json({
        success: false,
        message: "Питання не знайдено",
      });
      return;
    }

    const post = question.post as any;

    // Only post owner can answer
    if (post.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Тільки власник оголошення може відповідати на питання",
      });
      return;
    }

    question.answer = answer;
    question.answeredBy = req.user!._id;
    question.answeredAt = new Date();
    await question.save();

    // Notify question asker
    if (question.user.toString() !== req.user!._id.toString()) {
      await Notification.create({
        user: question.user,
        type: "answer",
        content: `Відповідь на ваше питання про "${post.title}"`,
        relatedPost: post._id,
        relatedUser: req.user!._id,
      });
    }

    res.json({
      success: true,
      data: await question.populate("answeredBy", "username avatar"),
    });
  }
);

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
export const deleteQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const question = await Question.findById(req.params.id);

    if (!question) {
      res.status(404).json({
        success: false,
        message: "Питання не знайдено",
      });
      return;
    }

    // Only question owner or post owner can delete
    const post = await Post.findById(question.post);
    if (
      question.user.toString() !== req.user!._id.toString() &&
      post?.user.toString() !== req.user!._id.toString() &&
      req.user!.role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Не маєте права видаляти це питання",
      });
      return;
    }

    await question.deleteOne();

    res.json({
      success: true,
      message: "Питання видалено",
    });
  }
);

