"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const snippetRoutes_1 = __importDefault(require("./routes/snippetRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const error_1 = require("./middleware/error");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production"
        ? ["https://dev-collab-frontend-nu.vercel.app"]
        : ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
exports.app.options("*", (0, cors_1.default)({
    origin: [
        "https://dev-collab-frontend-nu.vercel.app",
        "http://localhost:3000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
exports.app.use((0, helmet_1.default)());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.use(express_1.default.json({ limit: "1mb" }));
exports.app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300
}));
exports.app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});
exports.app.use("/api/auth", authRoutes_1.default);
exports.app.use("/api/projects", projectRoutes_1.default);
exports.app.use("/api/tasks", taskRoutes_1.default);
exports.app.use("/api/chat", chatRoutes_1.default);
exports.app.use("/api/snippets", snippetRoutes_1.default);
exports.app.use("/api/notifications", notificationRoutes_1.default);
exports.app.use("/api/users", userRoutes_1.default);
exports.app.use("/api/activity", activityRoutes_1.default);
exports.app.use("/api/ai", aiRoutes_1.default);
exports.app.use(error_1.errorHandler);
