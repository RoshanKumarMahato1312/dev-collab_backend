import mongoose from "mongoose";

export const connectDb = async (mongoUri: string): Promise<void> => {
  try {
    console.log("Connecting to MongoDB...");
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error.message);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
};
