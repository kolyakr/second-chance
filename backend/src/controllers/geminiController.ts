import { Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { geminiService } from "../services/geminiService";

// @desc    Generate product description using AI
// @route   POST /api/gemini/generate-description
// @access  Private
export const generateDescription = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { imagePaths, category, condition, brand, material, color } =
      req.body;

    if (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0) {
      res.status(400).json({
        success: false,
        message: "Потрібно принаймні одне зображення",
      });
      return;
    }

    try {
      const result = await geminiService.generateDescription(imagePaths, {
        category,
        condition,
        brand,
        material,
        color,
      });

      res.json({
        success: true,
        data: {
          title: result.title,
          description: result.description,
        },
      });
    } catch (error: any) {
      // Check for rate limiting (429) or quota errors
      if (
        error.message?.includes("429") ||
        error.message?.includes("quota") ||
        error.message?.includes("rate limit") ||
        error.message?.includes("Too Many Requests")
      ) {
        res.status(429).json({
          success: false,
          message:
            "AI сервіс тимчасово недоступний через обмеження швидкості. Спробуйте ще раз через кілька хвилин.",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || "Не вдалося згенерувати опис",
      });
    }
  }
);

// @desc    Analyze images to extract product information
// @route   POST /api/gemini/analyze-images
// @access  Private
export const analyzeImages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { imagePaths } = req.body;

    if (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0) {
      res.status(400).json({
        success: false,
        message: "Потрібно принаймні одне зображення",
      });
      return;
    }

    try {
      const analysis = await geminiService.analyzeImages(imagePaths);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      // Check for rate limiting (429) or quota errors
      if (
        error.message?.includes("429") ||
        error.message?.includes("quota") ||
        error.message?.includes("rate limit") ||
        error.message?.includes("Too Many Requests")
      ) {
        res.status(429).json({
          success: false,
          message:
            "AI сервіс тимчасово недоступний через обмеження швидкості. Спробуйте ще раз через кілька хвилин.",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || "Не вдалося проаналізувати зображення",
      });
    }
  }
);

// @desc    Enhance search query with AI
// @route   POST /api/gemini/enhance-search
// @access  Public
export const enhanceSearch = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Пошуковий запит обов'язковий",
      });
      return;
    }

    try {
      const filters = await geminiService.enhanceSearch(query.trim());

      res.json({
        success: true,
        data: filters,
      });
    } catch (error: any) {
      // Check for rate limiting (429) or quota errors
      if (
        error.message?.includes("429") ||
        error.message?.includes("quota") ||
        error.message?.includes("rate limit") ||
        error.message?.includes("Too Many Requests")
      ) {
        res.status(429).json({
          success: false,
          message:
            "AI пошук тимчасово недоступний через обмеження швидкості. Спробуйте ще раз через кілька хвилин або використайте звичайний пошук.",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || "Не вдалося покращити пошук",
      });
    }
  }
);
