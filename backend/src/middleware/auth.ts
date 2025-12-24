import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";
import User, { IUser } from "../models/User";

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: IUser;
  body: any;
  params: any;
  query: any;
  headers: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
      return;
    }

    try {
      // Verify token
      const decoded = verifyToken(token) as TokenPayload;

      // Get user from token
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        res.status(401).json({ success: false, message: "User not found" });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
      return;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};

// Optional authentication - sets req.user if token is present, but doesn't require it
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        // Verify token
        const decoded = verifyToken(token) as TokenPayload;

        // Get user from token
        const user = await User.findById(decoded.userId).select("-password");

        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without user
        console.log("Optional auth: Invalid token, continuing without user");
      }
    }

    next();
  } catch (error) {
    // Continue even if there's an error
    next();
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};
