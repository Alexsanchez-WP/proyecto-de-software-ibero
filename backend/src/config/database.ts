import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

class Database {
  private static instance: Database;

  private constructor() {
    // Connection should be called explicitly
  }

  public async connect() {
    try {
      const mongoURI =
        process.env.MONGO_URI || "mongodb://127.0.0.1:27017/electroshop";
      await mongoose.connect(mongoURI);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
    }
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

export default Database;
