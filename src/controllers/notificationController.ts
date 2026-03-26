import type { Request, Response } from "express";
import { Notification } from "../models/Notification";

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  const unreadCount = notifications.filter((item) => !item.read).length;

  res.json({ notifications, unreadCount });
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    res.status(404).json({ message: "Notification not found" });
    return;
  }

  res.json({ notification });
};
