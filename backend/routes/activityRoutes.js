import { Router } from "express";
import { createActivity, deleteActivity, listActivities } from "../controllers/activityController.js";

const router = Router();

router.get("/", listActivities);
router.post("/", createActivity);
router.delete("/:activityId", deleteActivity);

export default router;
