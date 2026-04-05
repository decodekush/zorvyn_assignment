import { Router } from "express";
import { getUsers, updateRole, updateStatus } from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { ROLES } from "../utils/constants";

const router = Router();

// All user-management routes require ADMIN role
router.use(authenticate, requireRole([ROLES.ADMIN]));

router.get("/", getUsers);
router.put("/:id/role", updateRole);
router.put("/:id/status", updateStatus);

export default router;
