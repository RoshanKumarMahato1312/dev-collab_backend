"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectActivity = void 0;
const Activity_1 = require("../models/Activity");
const Project_1 = require("../models/Project");
const getProjectActivity = async (req, res) => {
    var _a;
    const { projectId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const project = await Project_1.Project.findOne({ _id: projectId, members: userId });
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const activities = await Activity_1.Activity.find({ projectId })
        .populate("actor", "name email")
        .sort({ createdAt: -1 })
        .limit(100);
    res.json({ activities });
};
exports.getProjectActivity = getProjectActivity;
