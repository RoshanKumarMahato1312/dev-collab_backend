"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.getNotifications = void 0;
const Notification_1 = require("../models/Notification");
const getNotifications = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const notifications = await Notification_1.Notification.find({ userId }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((item) => !item.read).length;
    res.json({ notifications, unreadCount });
};
exports.getNotifications = getNotifications;
const markNotificationRead = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { notificationId } = req.params;
    const notification = await Notification_1.Notification.findOneAndUpdate({ _id: notificationId, userId }, { read: true }, { new: true });
    if (!notification) {
        res.status(404).json({ message: "Notification not found" });
        return;
    }
    res.json({ notification });
};
exports.markNotificationRead = markNotificationRead;
