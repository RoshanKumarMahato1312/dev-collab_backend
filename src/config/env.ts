import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  groqApiKey: process.env.GROQ_API_KEY ?? ""
};

if (!env.mongoUri || !env.jwtSecret) {
  throw new Error("Missing required environment variables: MONGO_URI, JWT_SECRET");
}
