import mongoose from "mongoose";
import { config } from "dotenv";

config();

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URL);
  } catch (error) {
    console.log(error);
  }
};
