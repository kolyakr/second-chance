import { Response } from "express";
import Notification from "../models/Notification";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 50, unreadOnly = false } = req.query;

    const filter: any = { user: req.user!._id };
    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate("relatedUser", "username avatar")
      .populate("relatedPost", "title images")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({
      user: req.user!._id,
      isRead: false,
    });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  }
);

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res
        .status(404)
        .json({ success: false, message: "Notification not found" });
      return;
    }

    if (notification.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Not authorized to update this notification",
      });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      data: notification,
    });
  }
);

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await Notification.updateMany(
      { user: req.user!._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  }
);

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res
        .status(404)
        .json({ success: false, message: "Notification not found" });
      return;
    }

    if (notification.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Not authorized to delete this notification",
      });
      return;
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: "Notification deleted",
    });
  }
);
