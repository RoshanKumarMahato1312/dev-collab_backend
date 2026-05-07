"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    port: Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 5000),
    mongoUri: (_b = process.env.MONGO_URI) !== null && _b !== void 0 ? _b : "",
    jwtSecret: (_c = process.env.JWT_SECRET) !== null && _c !== void 0 ? _c : "",
    clientUrl: (_d = process.env.CLIENT_URL) !== null && _d !== void 0 ? _d : "http://localhost:3000",
    groqApiKey: (_e = process.env.GROQ_API_KEY) !== null && _e !== void 0 ? _e : ""
};
if (!exports.env.mongoUri || !exports.env.jwtSecret) {
    throw new Error("Missing required environment variables: MONGO_URI, JWT_SECRET");
}
