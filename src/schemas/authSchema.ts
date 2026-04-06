import { z } from "zod";
import { ROLES } from "../utils/constants";

// ─── Registration ────────────────────────────────────────────
// Role is NOT accepted during registration — all new users start as VIEWER.
// Admin can promote users later via PUT /api/users/:id/role.
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  email: z.string().email("Invalid email format").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ─── Login ───────────────────────────────────────────────────
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// ─── Role Update ─────────────────────────────────────────────
export const updateRoleSchema = z.object({
  role: z.enum([ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN]),
});

// ─── Status Update ───────────────────────────────────────────
export const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
