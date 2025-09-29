import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  //attributes of the game
  title: { type: String, required: true }, //1
  description: { type: String },           //2
  ageGroup: {                              //3
    type: String,
    enum: ["3-5", "6-8", "9-12"], // restrict to allowed ranges
    required: true  //backend validation
  },
  rating: { type: Number, min: 1, max: 10 },    //4
  difficultyLevel: {                            //5
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy"
  },
  category: { type: String }, // e.g. "Memory", "Sensory"   //6
  Game_image: { type: String }, // URL to the image         //7
  Game_URL: { type: String, required: true } // URL to play the game     //
  
  


});

//create model
const Game = mongoose.model("Game", gameSchema);
export default Game;
 
 



// models/Game.js




