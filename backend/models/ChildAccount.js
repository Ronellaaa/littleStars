import mongoose from "mongoose";

const childAccountSchema = new mongoose.Schema(
  {
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 32,
    },
    pinHash: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      default: "sunrise",
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

childAccountSchema.index({ username: 1 }, { unique: true });

export default mongoose.models.ChildAccount || mongoose.model("ChildAccount", childAccountSchema);
