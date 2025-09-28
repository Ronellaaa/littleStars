// backend/controllers/childSettingsController.js
import ChildSettings from "../models/ChildSettings.js";
const asyncH = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

export const getSettings = asyncH(async (req,res) => {
  const { childId } = req.params;
  const doc = await ChildSettings.findOne({ childId }) || { childId, shareWithMentor:false };
  res.json(doc);
});
export const setSettings = asyncH(async (req,res) => {
  const { childId } = req.params;
  const { shareWithMentor } = req.body;
  const doc = await ChildSettings.findOneAndUpdate(
    { childId },
    { $set: { shareWithMentor: !!shareWithMentor } },
    { new:true, upsert:true }
  );
  res.json(doc);
});
