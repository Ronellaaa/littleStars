import Scenario from "../models/Scenario.js";

const asyncH = fn => (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);

export async function listScenarios(req, res) {
  const { emotion } = req.query;
  const q = {};
  if (emotion) q.emotionName = emotion;
  // ✅ no createdBy filter here
  const items = await Scenario.find(q).sort({ createdAt: -1 });
  res.json(items);
}

export async function createScenario(req, res) {
  const { emotionName, text, imageUrl } = req.body;
  const doc = await Scenario.create({
    emotionName, text, imageUrl, isActive: true,
    createdBy: req.user?.sub || null, // nice to keep
  });
  res.status(201).json(doc);
}
export const updateScenario = asyncH(async (req,res) => {
  const { id } = req.params;
  const payload = {};
  ["emotionName","text","imageUrl","active"].forEach(k=>{
    if (req.body[k] !== undefined) payload[k] = req.body[k];
  });
  const doc = await Scenario.findByIdAndUpdate(id, { $set: payload }, { new:true });
  if (!doc) return res.status(404).json({ message:"Not found" });
  res.json(doc);
});

export const deleteScenario = asyncH(async (req,res) => {
  const { id } = req.params;
  const doc = await Scenario.findByIdAndDelete(id);
  if (!doc) return res.status(404).json({ message:"Not found" });
  res.status(204).end();
});
