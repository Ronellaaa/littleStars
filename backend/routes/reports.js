// routes/reports.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { canViewChild } from "../middleware/canViewChild.js";
import { getChildReport } from "../controllers/reportsController.js";

const r = Router();
r.get("/child/:childId", requireAuth, canViewChild, getChildReport);
export default r;
