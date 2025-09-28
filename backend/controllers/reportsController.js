// controllers/reportsController.js
import PracticeAttempt from "../models/PracticeAttempt.js";
const asyncH = fn => (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);

export const getChildReport = asyncH(async (req,res)=>{
  const { childId } = req.params;

  const byEmotion = await PracticeAttempt.aggregate([
    { $match: { childId: new (require("mongoose").Types.ObjectId)(childId) } },
    { $group: {
      _id: "$emotionName",
      attempts: { $sum: 1 },
      passes: { $sum: { $cond: ["$passed", 1, 0] } },
      avgScore: { $avg: "$score" },
      avgStars: { $avg: "$stars" },
      lastAt: { $max: "$createdAt" },
    }},
    { $project: {
      _id:0, emotion:"$_id", attempts:1,
      passRate: { $cond:[{$eq:["$attempts",0]}, 0, {$divide:["$passes","$attempts"]}] },
      avgScore:1, avgStars:1, lastAt:1
    }},
    { $sort: { emotion:1 } }
  ]);

  const recent = await PracticeAttempt
    .find({ childId })
    .sort({ createdAt:-1 })
    .limit(10)
    .lean();

  const overallAgg = await PracticeAttempt.aggregate([
    { $match: { childId: new (require("mongoose").Types.ObjectId)(childId) } },
    { $group: {
      _id: null,
      attempts: { $sum: 1 },
      passes: { $sum: { $cond: ["$passed", 1, 0] } },
      avgScore: { $avg: "$score" },
      avgStars: { $avg: "$stars" },
    }},
    { $project: {
      _id:0, attempts:1, passes:1,
      passRate: { $cond:[{$eq:["$attempts",0]}, 0, {$divide:["$passes","$attempts"]}] },
      avgScore:1, avgStars:1
    }},
  ]);
  const overall = overallAgg[0] || { attempts:0, passRate:0, avgScore:0, avgStars:0 };

  res.json({ childId, overall, byEmotion, recent });
});
