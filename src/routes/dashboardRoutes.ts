import { Router } from "express";
import {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getMonthlyTrends,
} from "../controllers/dashboardController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { ROLES } from "../utils/constants";

const router = Router();

// Dashboard is accessible to all authenticated roles (Viewer, Analyst, Admin)
router.use(authenticate, requireRole([ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN]));

router.get("/summary", getSummary);
router.get("/category-totals", getCategoryTotals);
router.get("/recent", getRecentActivity);
router.get("/monthly-trends", getMonthlyTrends);

export default router;
