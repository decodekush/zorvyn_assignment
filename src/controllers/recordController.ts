import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import {
  createRecordSchema,
  updateRecordSchema,
  recordQuerySchema,
} from "../schemas/recordSchema";

// ─── POST /api/records ───────────────────────────────────────
// Create a new financial record. Admin only.
export const createRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = createRecordSchema.parse(req.body);
    const userId = req.user!.userId;

    const record = await prisma.financialRecord.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: new Date(data.date),
        notes: data.notes,
        userId,
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/records ────────────────────────────────────────
// List records with optional filters and pagination.
// Supports: ?type=INCOME&category=Salary&startDate=...&endDate=...&page=1&limit=20
export const getRecords = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = recordQuerySchema.parse(req.query);
    const { type, category, search, startDate, endDate, page, limit } = query;

    // Build dynamic where clause
    const where: Record<string, unknown> = { isDeleted: false };
    if (type) where.type = type;
    if (category) where.category = category;
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.date = dateFilter;
    }
    if (search) {
      where.OR = [
        { category: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: { user: { select: { username: true } } },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/records/:id ────────────────────────────────────
export const getRecordById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const record = await prisma.financialRecord.findFirst({
      where: { id: String(req.params.id), isDeleted: false },
      include: { user: { select: { username: true } } },
    });

    if (!record) {
      res.status(404).json({ success: false, error: "Record not found" });
      return;
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/records/:id ────────────────────────────────────
export const updateRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = updateRecordSchema.parse(req.body);
    const id = String(req.params.id);

    // Ensure the record exists and isn't soft-deleted
    const existing = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: "Record not found" });
      return;
    }

    const updatePayload: Record<string, unknown> = { ...data };
    if (data.date) updatePayload.date = new Date(data.date);

    const record = await prisma.financialRecord.update({
      where: { id },
      data: updatePayload,
    });

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/records/:id ─────────────────────────────────
// Soft delete: sets isDeleted = true instead of removing the row.
export const deleteRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: "Record not found" });
      return;
    }

    await prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true },
    });

    res
      .status(200)
      .json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    next(error);
  }
};
