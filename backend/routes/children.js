import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createChild,
  listForMentor,
  listMine,
  assignMentor,
  getOrCreateDefaultChild,
  upsertChildAccount,
  deleteChild,
} from "../controllers/childrenController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("parent"),
  createChild
);

router.get(
  "/",
  requireAuth,
  requireRole("mentor"),
  listForMentor
);

router.get(
  "/mine",
  requireAuth,
  requireRole("parent"),
  listMine
);

router.get(
  "/default",
  requireAuth,
  requireRole("parent"),
  getOrCreateDefaultChild
);

router.put(
  "/:childId/assign",
  requireAuth,
  requireRole("parent", "mentor"),
  validateObjectId("childId"),
  assignMentor
);

router.put(
  "/:childId/account",
  requireAuth,
  requireRole("parent"),
  validateObjectId("childId"),
  upsertChildAccount
);

// Add POST route for creating child account (same as PUT for upsert)
router.post(
  "/:childId/account",
  requireAuth,
  requireRole("parent"),
  validateObjectId("childId"),
  upsertChildAccount
);

// Delete child
router.delete(
  "/:childId",
  requireAuth,
  requireRole("parent"),
  validateObjectId("childId"),
  deleteChild
);

export default router;
