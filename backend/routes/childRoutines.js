import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getChildRoutines,
  getChildRoutine,
  startRoutine,
  completeStep,
  finishRoutine,
  pauseRoutine
} from "../controllers/childRoutineController.js";

const router = Router();

// All routes require child authentication
router.use(requireAuth);
router.use(requireRole("child"));

// Get all routines for the authenticated child
router.get("/", getChildRoutines);

// Get specific routine
router.get("/:routineId", getChildRoutine);

// Start a routine
router.post("/:routineId/start", startRoutine);

// Complete a specific step
router.post("/:routineId/step/:stepIndex/complete", completeStep);

// Finish entire routine
router.post("/:routineId/finish", finishRoutine);

// Pause routine
router.post("/:routineId/pause", pauseRoutine);

export default router;
