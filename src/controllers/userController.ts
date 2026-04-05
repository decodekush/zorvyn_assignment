import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { updateRoleSchema, updateStatusSchema } from "../schemas/authSchema";

// ─── GET /api/users ──────────────────────────────────────────
// Returns all users (without passwords). Admin only.
export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/:id/role ─────────────────────────────────
// Update a user's role. Admin only.
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = updateRoleSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: String(id) },
      data: { role },
      select: { id: true, username: true, role: true, status: true },
    });

    res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/:id/status ───────────────────────────────
// Activate or deactivate a user. Admin only.
export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: String(id) },
      data: { status },
      select: { id: true, username: true, role: true, status: true },
    });

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
