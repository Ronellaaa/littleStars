import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    emotionName: {
      type: String,
      required: true,
      enum: ["happy", "sad", "angry", "surprised"],
    },
    title: { type: String, required: true },
    description: String,


    coverUrl: String,         
    videoUrl: String,         
    lottieUrl: String,       
    assistantText: String,    
 
    isActive: { type: Boolean, default: true },
    mentorEmail: String,
    mentorId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);


schema.index({ emotionName: 1, isActive: 1, createdAt: -1 });
schema.index({ title: "text", description: "text" });


export default mongoose.models.EmotionContent
  || mongoose.model("EmotionContent", schema);
