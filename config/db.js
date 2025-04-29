import dotenv from 'dotenv';
dotenv.config(); // ⬅️ call this BEFORE using process.env

import mongoose from 'mongoose';

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // now it works
    console.log("✅ MongoDB connected successfully.");
  } catch (error) {
    console.error( error.message);
  }
};
export default dbConnect;