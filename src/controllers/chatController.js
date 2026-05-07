"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = void 0;
const Project_1 = require("../models/Project");
const Message_1 = require("../models/Message");
const getMessages = async (req, res) => {
    var _a;
    const { projectId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const project = await Project_1.Project.findOne({ _id: projectId, members: userId });
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const messages = await Message_1.Message.find({ projectId }).populate("sender", "name email").sort({ createdAt: 1 });
    res.json({ messages });
};
exports.getMessages = getMessages;
