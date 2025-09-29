
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
 



const PORT = process.env.PORT || 5000;  //logicl or operator

app.use(cors());
app.use(bodyParser.json()); //get json data using body parser


const URL = process.env.MONGODB_URI; // database connection string
 
//database connection with error handling
mongoose.connect(URL)
  .then(() => {
    console.log("MongoDB connection successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

//open the database connection
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB connection successfully"); //message after connection success
});

connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});
import gameRouter from "./routes/GameRoutes.js"; //import game routes

app.use("/game", gameRouter);  //use game routes in the app 


//listen the port if connection success
app.listen(PORT, () => {
    console.log(`Server is running on port no ${PORT}`);
});
