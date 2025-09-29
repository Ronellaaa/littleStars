import { Router } from "express";
import {
  createRoutine,
  deleteRoutine,
  listRoutines,
  updateRoutine,
  listChildAssignedRoutines,
  listRoutinesForChild,
  assignRoutineToChild,
  unassignRoutineFromChild,
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
  requireAuth,
  requireRole("parent", "mentor"),
  validateObjectId("childId"),
  canViewChild,
  listRoutinesForChild
);

// Assign routine to child
router.post(
  "/:routineId/assign",
  requireAuth,
  requireRole("parent"),
  validateObjectId("routineId"),
  assignRoutineToChild
);

// Unassign routine from child
router.post(
  "/:routineId/unassign",
  requireAuth,
  requireRole("parent"),
  validateObjectId("routineId"),
  unassignRoutineFromChild
);

export default router;

