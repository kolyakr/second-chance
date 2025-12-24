import express from "express";
import {
  getAnalytics,
  getAllUsers,
  toggleBanUser,
  deletePostAdmin,
  getReportedComments,
  deleteCommentAdmin,
} from "../controllers/adminController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin", "moderator"));

router.get("/analytics", getAnalytics);
router.get("/users", getAllUsers);
router.put("/users/:id/ban", authorize("admin"), toggleBanUser);
router.delete("/posts/:id", deletePostAdmin);
router.get("/comments/reported", getReportedComments);
router.delete("/comments/:id", deleteCommentAdmin);

export default router;
