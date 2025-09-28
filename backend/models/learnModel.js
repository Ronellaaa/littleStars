import mongoose from "mongoose";
const LearnVideoSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    title: { type: String, required: true },
    src: { type: String, required: true },
    thumb: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("LearnVideo", LearnVideoSchema);
