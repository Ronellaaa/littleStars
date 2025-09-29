// backend/models/PracticeAttempt.js
import mongoose from "mongoose";
const schema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref:"Child", required:true, index:true },
  emotionName: { type:String, enum:["happy","sad","angry","surprised"], required:true, index:true },
  scenario: String,
  score: { type:Number, min:0, max:1 },
  passed: Boolean,
  stars: { type:Number, default:0, min:0, max:3 },
  difficulty: { type:String, enum:["easy","medium","hard"], default:"easy" },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true, index:true },
}, { timestamps:true });

export default mongoose.models.PracticeAttempt
  || mongoose.model("PracticeAttempt", schema);
