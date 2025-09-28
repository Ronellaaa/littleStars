import EmotionContent from "../models/EmotionContent.js";


const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const listContents = asyncH(async (req, res) => {
  const { emotion, q, includeInactive } = req.query;

const isMentor = req.user?.role === "mentor";
const filter = {
  ...(emotion ? { emotionName: emotion } : {}),
  ...(includeInactive && isMentor ? {} : { isActive: true })
};

  let query = EmotionContent.find(filter).sort({ createdAt: -1 });
  if (q?.trim()) query = query.find({ $text: { $search: q.trim() } });

  const items = await query.exec();
  res.json(items);
});

export const getContent = asyncH(async (req, res) => {
  const doc = await EmotionContent.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
});

export const createContent = asyncH(async (req, res) => {
  const doc = await EmotionContent.create(req.body);
  res.status(201).json(doc);
});

export const updateContent = asyncH(async (req, res) => {
  const doc = await EmotionContent.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
});

export const deleteContent = asyncH(async (req, res) => {
  await EmotionContent.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});
