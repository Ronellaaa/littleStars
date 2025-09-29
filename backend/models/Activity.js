import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    icon: { type: String, default: "" },
    defaultDurationMin: { type: Number, default: 5, min: 1 },
    description: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

activitySchema.index({ name: "text", tags: "text" });

export const Activity = mongoose.model("Activity", activitySchema);
