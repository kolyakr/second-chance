import { Response } from "express";
import SavedSearch from "../models/SavedSearch";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Create saved search
// @route   POST /api/saved-searches
// @access  Private
export const createSavedSearch = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, filters } = req.body;

    if (!name || !filters) {
      res.status(400).json({
        success: false,
        message: "Назва та фільтри обов'язкові",
      });
      return;
    }

    const savedSearch = await SavedSearch.create({
      user: req.user!._id,
      name,
      filters,
    });

    res.status(201).json({
      success: true,
      data: savedSearch,
    });
  }
);

// @desc    Get user's saved searches
// @route   GET /api/saved-searches
// @access  Private
export const getSavedSearches = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const savedSearches = await SavedSearch.find({ user: req.user!._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: savedSearches.length,
      data: savedSearches,
    });
  }
);

// @desc    Delete saved search
// @route   DELETE /api/saved-searches/:id
// @access  Private
export const deleteSavedSearch = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const savedSearch = await SavedSearch.findById(req.params.id);

    if (!savedSearch) {
      res.status(404).json({
        success: false,
        message: "Збережений пошук не знайдено",
      });
      return;
    }

    if (savedSearch.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Не маєте права видаляти цей пошук",
      });
      return;
    }

    await savedSearch.deleteOne();

    res.json({
      success: true,
      message: "Збережений пошук видалено",
    });
  }
);

