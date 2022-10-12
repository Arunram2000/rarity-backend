import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DB_USERNAME = process.env.DB_USERNAME ?? "implementation";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "wiwFhVEseIiTZe6c";

const URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@dewallstreet.fk54j.mongodb.net/RarityRanking?retryWrites=true&w=majority`;

async function connectDB() {
  try {
    await mongoose.connect(URL);
    console.log("Database connected");
  } catch (error) {
    console.log("error while connecting database");
  }
}

connectDB();
