"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("./env");
const Message_1 = require("../models/Message");
const Project_1 = require("../models/Project");
const Notification_1 = require("../models/Notification");
const activity_1 = require("../utils/activity");
const onlineByProject = new Map();
const socketUsers = new Map();
const EDIT_WINDOW_MS = 15 * 60 * 1000;
const setupSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: env_1.env.clientUrl,
            credentials: true
        }
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            next(new Error("Unauthorized"));
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
            socket.data.userId = decoded.id;
            next();
        }
        catch {
            next(new Error("Unauthorized"));
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        socketUsers.set(socket.id, { userId, rooms: new Set() });
        socket.on("join-project", ({ projectId }) => {
            var _a, _b;
            socket.join(projectId);
            (_a = socketUsers.get(socket.id)) === null || _a === void 0 ? void 0 : _a.rooms.add(projectId);
            const current = (_b = onlineByProject.get(projectId)) !== null && _b !== void 0 ? _b : new Set();
            current.add(userId);
            onlineByProject.set(projectId, current);
            io.to(projectId).emit("presence:update", { users: Array.from(current) });
        });
        socket.on("typing", ({ projectId, isTyping }) => {
            socket.to(projectId).emit("typing", { userId, isTyping });
        });
        socket.on("chat:send", async ({ projectId, text }) => {
            const message = await Message_1.Message.create({ projectId, text, sender: userId });
            const populated = await message.populate("sender", "name email");
            const project = await Project_1.Project.findById(projectId).select("members");
            if (project) {
                const recipients = project.members.filter((member) => String(member) !== userId);
                if (recipients.length > 0) {
                    await Notification_1.Notification.insertMany(recipients.map((member) => ({
                        userId: member,
                        message: "New message received in your project"
                    })));
                }
            }
            io.to(projectId).emit("chat:new", populated);
            await (0, activity_1.logActivity)({
                projectId,
                actor: String(userId),
                action: "sent message",
                entityType: "message",
                entityId: String(message._id),
                metadata: { text: text.slice(0, 80) }
            });
        });
        socket.on("chat:update", async ({ projectId, messageId, text }, callback) => {
            const trimmedText = text === null || text === void 0 ? void 0 : text.trim();
            if (!trimmedText) {
                const errorMessage = "Message text is required";
                socket.emit("chat:error", { message: errorMessage });
                callback === null || callback === void 0 ? void 0 : callback({ ok: false, error: errorMessage });
                return;
            }
            const project = await Project_1.Project.findOne({ _id: projectId, members: userId }).select("_id");
            if (!project) {
                const errorMessage = "Project not found";
                socket.emit("chat:error", { message: errorMessage });
                callback === null || callback === void 0 ? void 0 : callback({ ok: false, error: errorMessage });
                return;
            }
            const message = await Message_1.Message.findOne({ _id: messageId, projectId });
            if (!message) {
                const errorMessage = "Message not found";
                socket.emit("chat:error", { message: errorMessage });
                callback === null || callback === void 0 ? void 0 : callback({ ok: false, error: errorMessage });
                return;
            }
            if (String(message.sender) !== String(userId)) {
                const errorMessage = "Only sender can edit this message";
                socket.emit("chat:error", { message: errorMessage });
                callback === null || callback === void 0 ? void 0 : callback({ ok: false, error: errorMessage });
                return;
            }
            const ageMs = Date.now() - new Date(message.createdAt).getTime();
            if (ageMs > EDIT_WINDOW_MS) {
                const errorMessage = "You can edit messages only within 15 minutes";
                socket.emit("chat:error", { message: errorMessage });
                callback === null || callback === void 0 ? void 0 : callback({ ok: false, error: errorMessage });
                return;
            }
            message.text = trimmedText;
            await message.save();
            const populated = await message.populate("sender", "name email");
            const updatedMessage = populated.toObject();
            io.to(projectId).emit("chat:updated", updatedMessage);
            callback === null || callback === void 0 ? void 0 : callback({ ok: true, message: updatedMessage });
            await (0, activity_1.logActivity)({
                projectId,
                actor: String(userId),
                action: "updated message",
                entityType: "message",
                entityId: String(message._id),
                metadata: { text: trimmedText.slice(0, 80) }
            });
        });
        socket.on("disconnect", () => {
            const socketUser = socketUsers.get(socket.id);
            if (!socketUser)
                return;
            socketUser.rooms.forEach((projectId) => {
                const current = onlineByProject.get(projectId);
                if (!current)
                    return;
                current.delete(socketUser.userId);
                io.to(projectId).emit("presence:update", { users: Array.from(current) });
                if (current.size === 0) {
                    onlineByProject.delete(projectId);
                }
            });
            socketUsers.delete(socket.id);
        });
    });
    return io;
};
exports.setupSocket = setupSocket;
