"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDb = async (mongoUri) => {
    try {
        console.log("Connecting to MongoDB...");
        const connection = await mongoose_1.default.connect(mongoUri);
        console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
        mongoose_1.default.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected");
        });
        mongoose_1.default.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error.message);
        });
    }
    catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error;
    }
};
exports.connectDb = connectDb;
