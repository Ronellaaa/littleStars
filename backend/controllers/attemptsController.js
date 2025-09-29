// backend/controllers/attemptsController.js
import mongoose from "mongoose";
import PracticeAttempt from "../models/PracticeAttempt.js";

const asyncH = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const createAttempt = asyncH(async (req, res) => {
  // Basic allow-list; extend/validate as you like
  const {
    childId,
    emotionName,
    scenario,
    score,
    passed,
    stars,
    difficulty,
  } = req.body || {};

  const doc = await PracticeAttempt.create({
    childId,
    emotionName,
    scenario,
    score,
    passed: !!passed,
    stars: Number(stars ?? 0),
    difficulty: difficulty || "easy",
    // recordedBy could be set here if requireAuth is used on this route:
    recordedBy: req.user?.sub,
  });

  res.status(201).json(doc);
});

export const listAttempts = asyncH(async (req, res) => {
  const { childId, emotion, limit = 20 } = req.query;
  const q = {};
  if (childId) q.childId = childId;             // find() auto-casts strings
  if (emotion) q.emotionName = emotion;

  const items = await PracticeAttempt.find(q)
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json(items);
});

export const statsAttempts = asyncH(async (req, res) => {
  const { childId, days = 30 } = req.query;

  const since = new Date(Date.now() - Number(days) * 24 * 3600 * 1000);

  const match = { createdAt: { $gte: since } };

  // IMPORTANT: aggregate requires manual ObjectId casting
  if (childId) {
    try {
      match.childId = new mongoose.Types.ObjectId(childId);
    } catch {
      return res.status(400).json({ message: "Invalid childId" });
    }
  }

  const m = await PracticeAttempt.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$emotionName",
        attempts: { $sum: 1 },
        passes: { $sum: { $cond: ["$passed", 1, 0] } },
        avgScore: { $avg: "$score" },
        avgStars: { $avg: "$stars" },
      },
    },
    {
      $project: {
        _id: 0,
        emotion: "$_id",
        attempts: 1,
        passRate: {
          $cond: [
            { $eq: ["$attempts", 0] },
            0,
            { $divide: ["$passes", "$attempts"] },
          ],
        },
        avgScore: 1,
        avgStars: 1,
      },
    },
    { $sort: { emotion: 1 } },
  ]);

  res.json(m);
});
