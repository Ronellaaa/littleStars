import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  childId: String,
  cardTitle: String,
  transcript: String,
  success: Boolean,
  feedbackMsg: String,
  createdAt: { type: Date, default: Date.now },
  category: {
    type: String,
    required: true,
    enum: ["food", "family", "actions", "emotions", "objects", "places", "people", "animals", "vehicles", "colours"]
  }
});

export default mongoose.model("Attempt", attemptSchema);