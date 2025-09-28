import express from "express";
import { createAttempt, getAttempts, updateAttemptById, deleteAttemptById, getStatsByCategory } from "../controllers/AttemptController.js";

const router = express.Router();

// 📌 Save a new attempt
router.post("/", createAttempt);

// 📌 Get attempts (all or filtered by childId/cardTitle/period)
router.get("/", getAttempts);

// 📌 Update attempt by ID
router.put("/:id", updateAttemptById);

// 📌 Delete attempt by ID
router.delete("/:id", deleteAttemptById);

// 👇 New route for stats aggregation
router.get("/stats/category", getStatsByCategory);

export default router;