import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const MONGODB_URI = process.env.MONGODB_URI as string;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
  console.log("JWT_SECRET from .env:", process.env.JWT_SECRET);

  console.log("🔍 MongoDB URI:", MONGODB_URI); // Add before connect
};
