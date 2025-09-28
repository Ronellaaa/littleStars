// backend/routes/thresholds.js
import { Router } from "express";
import { getThreshold, upsertThreshold } from "../controllers/thresholdsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { canViewChild } from "../middleware/canViewChild.js";

const r = Router();

// parent or mentor of the child can read
r.get("/:childId/:emotion", requireAuth, canViewChild, getThreshold);

// mentor only can upsert
r.put("/:childId/:emotion", requireAuth, requireRole("mentor"), upsertThreshold);

export default r;
