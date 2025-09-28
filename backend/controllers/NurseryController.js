import LearnVideo from "../models/learnModel";

const NurseryLearnVideos = {
  getVideos: async (req, res) => {
    try {
      const { topic } = req.params;
      const videos = await LearnVideo.find({ topic }).limit(5);
      return res.json(videos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  addVideos: async (req, res) => {
    try {
      const { topic } = req.params;
      const count = await LearnVideo.countDocuments({ topic });
      if (count > 5) {
        return res
          .status(500)
          .json({ error: "Max 5 videos allowed per topic." });
      }
      const video = new LearnVideo({ ...req.body, topic });
      await video.save();
      return res.status(201).json(video);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  deleteVideos: async (req, res) => {
    try {
      const { id } = req.params;
      await LearnVideo.findById(id);
      return res.json({ message: "Video deleted" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
