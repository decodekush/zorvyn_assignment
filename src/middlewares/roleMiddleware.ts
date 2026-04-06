import { Request, Response, NextFunction } from "express";
import { Role } from "../utils/constants";

// ─── Role Guard Middleware ───────────────────────────────────
// Factory that returns a middleware allowing only specified roles.
// Usage: requireRole([ROLES.ADMIN, ROLES.ANALYST])
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as Role | undefined;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: "Forbidden: You do not have permission to perform this action",
      });
      return;
    }

    next();
  };
};
