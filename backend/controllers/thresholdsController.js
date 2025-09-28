import ChildThreshold from "../models/ChildThreshold.js";

const asyncH = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);


export const getThreshold = asyncH(async (req,res) => {
  const { childId, emotion } = req.params;
  const doc = await ChildThreshold.findOne({ childId, emotionName: emotion });
  if (!doc) {
    // send sensible defaults with 200
    return res.json({ childId, emotionName: emotion, level: 1, threshold: 0.75, holdMs: 1000 });
  }
  res.json(doc);
});

export const upsertThreshold = asyncH(async (req,res) => {
  const { childId, emotion } = req.params;
  const { level, threshold, holdMs } = req.body;
  const doc = await ChildThreshold.findOneAndUpdate(
    { childId, emotionName: emotion },
    {
      $set: {
        ...(level ? { level } : {}),
        ...(threshold != null ? { threshold: Number(threshold) } : {}),
        ...(holdMs != null ? { holdMs: Number(holdMs) } : {}),
      }
    },
    { new:true, upsert:true }
  );
  res.json(doc);
});

