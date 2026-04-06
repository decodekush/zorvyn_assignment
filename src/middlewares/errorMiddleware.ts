import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// ─── Centralized Error Handler ───────────────────────────────
// Catches all errors thrown via next(error) and returns a
// consistent JSON response with appropriate HTTP status codes.

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Zod validation errors → 400
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    res.status(400).json({ success: false, error: "Validation failed", details });
    return;
  }

  // Prisma "record not found" → 404
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    res.status(404).json({ success: false, error: "Record not found" });
    return;
  }

  // Prisma unique constraint violation → 409
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    res.status(409).json({ success: false, error: "A record with this value already exists" });
    return;
  }

  // Everything else → 500
  console.error("[Error]", err.message);
  res.status(500).json({ success: false, error: "Internal server error" });
};
