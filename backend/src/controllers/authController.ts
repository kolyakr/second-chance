import { Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/User";
import { generateToken, generateEmailVerificationToken } from "../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password, username, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Користувач з цією електронною адресою або ім'ям вже існує",
      });
      return;
    }

    // Create verification token
    const verificationToken = generateEmailVerificationToken();

    // Create user
    const user = await User.create({
      email,
      password,
      username,
      firstName,
      lastName,
      emailVerificationToken: verificationToken,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (error) {
      console.error("Error sending verification email:", error);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  }
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401).json({ success: false, message: "Невірні облікові дані" });
    return;
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401).json({ success: false, message: "Невірні облікові дані" });
    return;
  }

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
    },
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);

  res.json({
    success: true,
    user,
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.query;

    if (!token) {
      res
        .status(400)
        .json({ success: false, message: "Токен верифікації обов'язковий" });
      return;
    }

    const user = await User.findOne({
      emailVerificationToken: token as string,
    });

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "Невірний токен верифікації" });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Електронну адресу успішно підтверджено",
    });
  }
);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists for security
      res.json({
        success: true,
        message: "Якщо електронна адреса існує, посилання для скидання пароля надіслано",
      });
      return;
    }

    // Generate reset token
    const resetToken = generateEmailVerificationToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw error;
    }

    res.json({
      success: true,
      message: "Якщо електронна адреса існує, посилання для скидання пароля надіслано",
    });
  }
);

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "Невірний або прострочений токен" });
      return;
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate token
    const jwtToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      token: jwtToken,
      message: "Пароль успішно скинуто",
    });
  }
);
