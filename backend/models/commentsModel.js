import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);
