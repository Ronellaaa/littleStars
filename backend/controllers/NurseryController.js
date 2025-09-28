// ESM: make sure to include .js on local imports elsewhere
import LearnVideo from "../models/learnModel.js";

// GET /api/videos/:topic/videos
export async function getVideos(req, res) {
  try {
    const { topic } = req.params;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const videos = await LearnVideo.find({ topic })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json(videos);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /api/videos/:topic/videos   (cap at 5)
export async function addVideos(req, res) {
  try {
    const { topic } = req.params;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const count = await LearnVideo.countDocuments({ topic });
    if (count >= 5) {
      return res.status(409).json({ error: "Max 5 videos allowed per topic." });
    }

    const { url, title, thumbnail } = req.body; // adjust to your schema
    if (!url || !title) {
      return res.status(400).json({ error: "url and title are required" });
    }

    const video = await LearnVideo.create({ topic, url, title, thumbnail });
    return res.status(201).json(video);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// DELETE /api/videos/:topic/videos/:id
export async function deleteVideos(req, res) {
  try {
    const { id } = req.params;
    const doc = await LearnVideo.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: "Video not found" });
    return res.json({ message: "Video deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
