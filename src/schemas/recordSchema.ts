import { z } from "zod";

// ─── Create Record ───────────────────────────────────────────
export const createRecordSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required").max(100),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format. Use ISO 8601 (e.g. 2025-01-15)",
  }),
  notes: z.string().max(500).optional(),
});

// ─── Update Record (all fields optional) ─────────────────────
export const updateRecordSchema = createRecordSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

// ─── Query Filters ───────────────────────────────────────────
export const recordQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
  search: z.string().max(100).optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid startDate" })
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid endDate" })
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
