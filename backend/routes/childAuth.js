import { Router } from "express";
import { childLogin, childMe } from "../controllers/childAuthController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/login", childLogin);
router.get("/me", requireAuth, requireRole("child"), childMe);

export default router;
