import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ─── JWT Payload Shape ───────────────────────────────────────
export interface JwtPayload {
  userId: string;
  role: string;
}

// Extend Express Request to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── Auth Middleware ─────────────────────────────────────────
// Validates the Bearer token and attaches user info to req.user.
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "No token provided" });
    return;
  }

  const token = header.split(" ")[1];
  const secret = process.env.JWT_SECRET || "fallback_secret";

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};
