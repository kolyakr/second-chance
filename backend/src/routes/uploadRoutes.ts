import express from "express";
import { uploadSingle, uploadMultiple } from "../middleware/upload";
import { protect } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private
export const uploadSingleImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
      },
    });
  }
);

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultipleImages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({ success: false, message: "No files uploaded" });
      return;
    }

    const files = (req.files as Express.Multer.File[]).map((file) => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
    }));

    res.json({
      success: true,
      count: files.length,
      data: files,
    });
  }
);

const router = express.Router();

router.post("/single", protect, uploadSingle, uploadSingleImage);
router.post("/multiple", protect, uploadMultiple, uploadMultipleImages);

export default router;
