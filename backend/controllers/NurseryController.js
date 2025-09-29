

import LearnVideo from "../models/learnModel.js";

// GET /api/learn/:topic/videos
export async function getVideos(req, res) {
  try {
    const { topic } = req.params;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const docs = await LearnVideo.find({ topic })
      .sort({ createdAt: -1 })
      .limit(5);

    // Already in {title, url, thumbnail}, return directly
    return res.json(docs);
  } catch (err) {
    console.error("getVideos error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// POST /api/learn/:topic/videos (cap at 5 per topic)
export async function addVideos(req, res) {
  try {
    const { topic } = req.params;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const count = await LearnVideo.countDocuments({ topic });
    if (count >= 5) {
      return res.status(409).json({ error: "Max 5 videos allowed per topic." });
    }

    const title = req.body.title;
    const url = req.body.url || req.body.src;              // accept either
    const thumbnail = req.body.thumbnail || req.body.thumb;

    if (!title || !url) {
      return res.status(400).json({ error: "title and url are required" });
    }

    const doc = await LearnVideo.create({
      topic,
      title,
      url,
      thumbnail, 
      uploadedBy: req.body.uploadedBy || undefined,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error("addVideos error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// DELETE /api/learn/:topic/videos/:id
export async function deleteVideos(req, res) {
  try {
    const { id } = req.params;
    const doc = await LearnVideo.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: "Video not found" });
    return res.json({ message: "Video deleted" });
  } catch (err) {
    console.error("deleteVideos error:", err);
    return res.status(500).json({ error: err.message });
  }
}
