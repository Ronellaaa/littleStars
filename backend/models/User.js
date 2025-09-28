import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["parent", "mentor"], required: true },
}, { timestamps: true });

//userSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
