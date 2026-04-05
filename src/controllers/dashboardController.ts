import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

// ─── GET /api/dashboard/summary ──────────────────────────────
// Returns total income, total expenses, and net balance.
export const getSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const incomeAgg = await prisma.financialRecord.aggregate({
      where: { type: "INCOME", isDeleted: false },
      _sum: { amount: true },
      _count: true,
    });

    const expenseAgg = await prisma.financialRecord.aggregate({
      where: { type: "EXPENSE", isDeleted: false },
      _sum: { amount: true },
      _count: true,
    });

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpenses = expenseAgg._sum.amount || 0;

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        recordCount: {
          income: incomeAgg._count,
          expense: expenseAgg._count,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/dashboard/category-totals ──────────────────────
// Returns totals grouped by category and type.
export const getCategoryTotals = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totals = await prisma.financialRecord.groupBy({
      by: ["category", "type"],
      where: { isDeleted: false },
      _sum: { amount: true },
      _count: true,
      orderBy: { category: "asc" },
    });

    const result = totals.map((t) => ({
      category: t.category,
      type: t.type,
      total: t._sum.amount || 0,
      count: t._count,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/dashboard/recent ───────────────────────────────
// Returns the 10 most recent financial records.
export const getRecentActivity = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const records = await prisma.financialRecord.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { username: true } } },
    });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/dashboard/monthly-trends ───────────────────────
// Returns income and expense totals grouped by month.
export const getMonthlyTrends = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const records = await prisma.financialRecord.findMany({
      where: { isDeleted: false },
      select: { date: true, type: true, amount: true },
      orderBy: { date: "asc" },
    });

    // Group by YYYY-MM
    const monthMap = new Map<
      string,
      { income: number; expense: number }
    >();

    for (const r of records) {
      const key = r.date.toISOString().slice(0, 7); // "2025-01"
      const bucket = monthMap.get(key) || { income: 0, expense: 0 };

      if (r.type === "INCOME") bucket.income += r.amount;
      else bucket.expense += r.amount;

      monthMap.set(key, bucket);
    }

    const trends = Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    }));

    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
};
