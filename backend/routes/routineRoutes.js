import { Router } from "express";
import {
  createRoutine,
  deleteRoutine,
  listRoutines,
  updateRoutine,
  listChildAssignedRoutines,
  listRoutinesForChild,
} from "../controllers/routineController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { canViewChild } from "../middleware/canViewChild.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = Router();

router.get("/", listRoutines);
router.post("/", createRoutine);
router.put("/:routineId", updateRoutine);
router.delete("/:routineId", deleteRoutine);

router.get(
  "/assigned/me",
  requireAuth,
  requireRole("child"),
  listChildAssignedRoutines
);

router.get(
  "/child/:childId",
  requireAuth,\n  requireRole("parent", "mentor"),\n  validateObjectId("childId"),\n  canViewChild,
  listRoutinesForChild
);

export default router;

