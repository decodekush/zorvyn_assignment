import { Router } from "express";
import {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from "../controllers/recordController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { ROLES } from "../utils/constants";

const router = Router();

// All record routes require authentication
router.use(authenticate);

// Read access: Analyst + Admin
router.get("/", requireRole([ROLES.ANALYST, ROLES.ADMIN]), getRecords);
router.get("/:id", requireRole([ROLES.ANALYST, ROLES.ADMIN]), getRecordById);

// Write access: Admin only
router.post("/", requireRole([ROLES.ADMIN]), createRecord);
router.put("/:id", requireRole([ROLES.ADMIN]), updateRecord);
router.delete("/:id", requireRole([ROLES.ADMIN]), deleteRecord);

export default router;
