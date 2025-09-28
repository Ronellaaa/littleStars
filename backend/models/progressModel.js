import mongoose from "mongoose";
const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    completedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
    status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
    progressPct: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  }
);

export default mongoose.model("Progress", ProgressSchema);
