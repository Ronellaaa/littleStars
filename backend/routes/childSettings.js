// backend/routes/childSettings.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getSettings, setSettings } from "../controllers/childSettingsController.js";
const router = Router();
router.get("/:childId", requireAuth, getSettings);
router.put("/:childId", requireAuth, setSettings);
export default router;
