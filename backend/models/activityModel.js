import mongoose from "mongoose";


const ActivitySchema = new mongoose.Schema(
  {
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    type: { type: String, enum: ["quiz", "drag_drop", "matching"], required: true },
    instructions: { type: String },
    config: { type: Object }, // flexible field to store activity data (quiz questions, drag-drop items, etc.)
    maxPoints: { type: Number, default: 10 }
  }
);

export default mongoose.model("Activity", ActivitySchema);
