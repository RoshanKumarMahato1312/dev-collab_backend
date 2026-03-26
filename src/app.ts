import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import chatRoutes from "./routes/chatRoutes";
import snippetRoutes from "./routes/snippetRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import userRoutes from "./routes/userRoutes";
import activityRoutes from "./routes/activityRoutes";
import aiRoutes from "./routes/aiRoutes";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorHandler);
