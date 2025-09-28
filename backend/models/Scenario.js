// backend/models/Scenario.js
import mongoose from "mongoose";
const ScenarioSchema = new mongoose.Schema({
  emotionName: { type:String, enum:["happy","sad","angry","surprised"], required:true, index:true },
  text: { type:String, required:true },
  imageUrl: { type:String },    // FE can import from /src/assets and store a public URL if you deploy a CDN
  isActive: { type:Boolean, default:true },
  createdBy: { type:String, default: null },
}, { timestamps:true });

export default mongoose.models.Scenario || mongoose.model("Scenario", ScenarioSchema);

