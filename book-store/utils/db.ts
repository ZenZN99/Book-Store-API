import mongoose from "mongoose";

export async function connectDB() {
  const url = process.env.DB as string;
  try {
    await mongoose.connect(url);
    console.log("Database Connection");
  } catch (error) {
    console.log("Database Fail", error);
  }
}
