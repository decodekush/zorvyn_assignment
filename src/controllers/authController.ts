import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import { registerSchema, loginSchema } from "../schemas/authSchema";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_EXPIRY = "24h";

// ─── POST /api/auth/register ─────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if username already exists
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      res.status(409).json({ success: false, error: "Username already taken" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        // Always VIEWER on registration — admins promote via /api/users/:id/role
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (!user) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    // Block inactive users from logging in
    if (user.status !== "ACTIVE") {
      res
        .status(403)
        .json({ success: false, error: "Account is inactive. Contact an admin." });
      return;
    }

    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        token,
        user: { id: user.id, username: user.username, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};
