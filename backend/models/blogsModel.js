
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
  title: { type: String, required: true, trim: true, maxLength: 120 },
  author: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  category: {
    type: String,
    enum: ["Q&A", "Tips", "Stories", "Resources"],
    required: true,
  },
  content: { type: String, required: true },
  wordCount: { type: Number, default: 0 },
  coverImageUrl: { type: String },
},
{ timestamps: true }
);
export default mongoose.model("Blog", blogSchema);