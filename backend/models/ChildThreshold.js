import mongoose from "mongoose";
const schema = new mongoose.Schema({
  childId: { type:String, required:true },                // you can also store "global" per role, but childId is fine
  emotionName: { type:String, enum:["happy","sad","angry","surprised"], required:true },
  level: { type:Number, default: 1 },
  threshold: { type:Number, default: 0.75 },             // min prob to count as “correct”
  holdMs: { type:Number, default: 1000 },                // must hold ≥ threshold for this many ms
}, { timestamps:true });

schema.index({ childId:1, emotionName:1 }, { unique:true });

export default mongoose.models.ChildThreshold
  || mongoose.model("ChildThreshold", schema);
