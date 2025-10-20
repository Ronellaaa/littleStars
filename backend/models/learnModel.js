// models/learnModel.js
import mongoose from "mongoose";

const LearnVideoSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    title: { type: String, required: true },
    url:   { type: String, required: true }, // video URL
    thumbnail: { type: String },             // optional thumbnail
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("LearnVideo", LearnVideoSchema);
