import express, { Application } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

import connectDB from "./config/database";
import { errorHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import likeRoutes from "./routes/likeRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import userRoutes from "./routes/userRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import adminRoutes from "./routes/adminRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import geminiRoutes from "./routes/geminiRoutes";

// Load env vars
dotenv.config();

// Check for required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "⚠️  WARNING: GEMINI_API_KEY is not set in environment variables. Gemini AI features will not work."
  );
  console.warn(
    "   To enable Gemini features, add GEMINI_API_KEY to your .env file"
  );
  console.warn(
    "   Get your API key at: https://makersuite.google.com/app/apikey"
  );
} else {
  console.log("✅ Gemini API key loaded successfully");
}

// Connect to database
connectDB();

// Initialize app
const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health check - має бути перед rate limiting
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Rate limiting - більш гнучка конфігурація
const isDevelopment = process.env.NODE_ENV === "development";

// Загальний rate limiter для всіх API (більш м'який для development)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 200, // Більший ліміт для development
  message: {
    success: false,
    message: "Забагато запитів з цієї IP адреси, спробуйте пізніше",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Пропускаємо помилки rate limiting для development
  skip: (req) => {
    // В development режимі можна пропустити rate limiting для localhost
    if (isDevelopment && req.ip === "::1") {
      return false; // Все одно застосовуємо, але з більшим лімітом
    }
    return false;
  },
});

// Застосовуємо rate limiting до всіх API endpoints (крім health check)
app.use("/api/", generalLimiter);

// Body parser (for all other routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stripe webhook needs raw body - handle it before JSON parser
// Import the handler directly to avoid type issues
import { handleWebhook } from "./controllers/paymentController";

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook as any
);

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Socket.io connection handling
io.on("connection", (socket: any) => {
  console.log("User connected:", socket.id);

  // Join user's personal room (for notifications)
  socket.on("join-user-room", (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io available to routes (for emitting events from controllers)
app.set("io", io);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/gemini", geminiRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

export { io };
