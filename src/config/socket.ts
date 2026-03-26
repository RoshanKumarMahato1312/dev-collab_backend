import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env";
import { Message } from "../models/Message";
import { Project } from "../models/Project";
import { Notification } from "../models/Notification";
import { logActivity } from "../utils/activity";

type SocketUser = {
  userId: string;
  rooms: Set<string>;
};

const onlineByProject = new Map<string, Set<string>>();
const socketUsers = new Map<string, SocketUser>();
const EDIT_WINDOW_MS = 15 * 60 * 1000;

export const setupSocket = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    socketUsers.set(socket.id, { userId, rooms: new Set() });

    socket.on("join-project", ({ projectId }: { projectId: string }) => {
      socket.join(projectId);
      socketUsers.get(socket.id)?.rooms.add(projectId);

      const current = onlineByProject.get(projectId) ?? new Set<string>();
      current.add(userId);
      onlineByProject.set(projectId, current);

      io.to(projectId).emit("presence:update", { users: Array.from(current) });
    });

    socket.on("typing", ({ projectId, isTyping }: { projectId: string; isTyping: boolean }) => {
      socket.to(projectId).emit("typing", { userId, isTyping });
    });

    socket.on("chat:send", async ({ projectId, text }: { projectId: string; text: string }) => {
      const message = await Message.create({ projectId, text, sender: userId });
      const populated = await message.populate("sender", "name email");

      const project = await Project.findById(projectId).select("members");
      if (project) {
        const recipients = project.members.filter((member: unknown) => String(member) !== userId);
        if (recipients.length > 0) {
          await Notification.insertMany(
            recipients.map((member: unknown) => ({
              userId: member,
              message: "New message received in your project"
            }))
          );
        }
      }

      io.to(projectId).emit("chat:new", populated);

      await logActivity({
        projectId,
        actor: String(userId),
        action: "sent message",
        entityType: "message",
        entityId: String(message._id),
        metadata: { text: text.slice(0, 80) }
      });
    });

    socket.on(
      "chat:update",
      async (
        { projectId, messageId, text }: { projectId: string; messageId: string; text: string },
        callback?: (response: { ok: boolean; message?: unknown; error?: string }) => void
      ) => {
        const trimmedText = text?.trim();
        if (!trimmedText) {
          const errorMessage = "Message text is required";
          socket.emit("chat:error", { message: errorMessage });
          callback?.({ ok: false, error: errorMessage });
          return;
        }

        const project = await Project.findOne({ _id: projectId, members: userId }).select("_id");
        if (!project) {
          const errorMessage = "Project not found";
          socket.emit("chat:error", { message: errorMessage });
          callback?.({ ok: false, error: errorMessage });
          return;
        }

        const message = await Message.findOne({ _id: messageId, projectId });
        if (!message) {
          const errorMessage = "Message not found";
          socket.emit("chat:error", { message: errorMessage });
          callback?.({ ok: false, error: errorMessage });
          return;
        }

        if (String(message.sender) !== String(userId)) {
          const errorMessage = "Only sender can edit this message";
          socket.emit("chat:error", { message: errorMessage });
          callback?.({ ok: false, error: errorMessage });
          return;
        }

        const ageMs = Date.now() - new Date(message.createdAt).getTime();
        if (ageMs > EDIT_WINDOW_MS) {
          const errorMessage = "You can edit messages only within 15 minutes";
          socket.emit("chat:error", { message: errorMessage });
          callback?.({ ok: false, error: errorMessage });
          return;
        }

        message.text = trimmedText;
        await message.save();

        const populated = await message.populate("sender", "name email");
        const updatedMessage = populated.toObject();
        io.to(projectId).emit("chat:updated", updatedMessage);
        callback?.({ ok: true, message: updatedMessage });

        await logActivity({
          projectId,
          actor: String(userId),
          action: "updated message",
          entityType: "message",
          entityId: String(message._id),
          metadata: { text: trimmedText.slice(0, 80) }
        });
      }
    );

    socket.on("disconnect", () => {
      const socketUser = socketUsers.get(socket.id);
      if (!socketUser) return;

      socketUser.rooms.forEach((projectId) => {
        const current = onlineByProject.get(projectId);
        if (!current) return;

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
