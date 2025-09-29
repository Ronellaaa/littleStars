import mongoose from "mongoose";


const LessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    mediaUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
  }
);

export default mongoose.model("Lesson", LessonSchema);

