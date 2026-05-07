"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTasks = exports.createTask = void 0;
const zod_1 = require("zod");
const Task_1 = require("../models/Task");
const Project_1 = require("../models/Project");
const Notification_1 = require("../models/Notification");
const projectRole_1 = require("../utils/projectRole");
const activity_1 = require("../utils/activity");
const taskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().default(""),
    assignedTo: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().optional()
});
const updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().nullable().optional(),
    dueDate: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(["todo", "in-progress", "done"]).optional()
});
const createTask = async (req, res) => {
    var _a;
    const projectId = String(req.params.projectId);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const body = taskSchema.parse(req.body);
    const project = await Project_1.Project.findOne({ _id: projectId, members: userId });
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const role = (0, projectRole_1.getUserProjectRole)(project, String(userId));
    if (role === "none") {
        res.status(403).json({ message: "Only project members can create tasks" });
        return;
    }
    const task = await Task_1.Task.create({
        title: body.title,
        description: body.description,
        assignedTo: body.assignedTo ? String(body.assignedTo) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        projectId
    });
    if (body.assignedTo) {
        await Notification_1.Notification.create({ userId: body.assignedTo, message: `You were assigned task: ${body.title}` });
    }
    await (0, activity_1.logActivity)({
        projectId,
        actor: String(userId),
        action: "created task",
        entityType: "task",
        entityId: String(task._id),
        metadata: { title: task.title }
    });
    res.status(201).json({ task });
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    var _a;
    const projectId = String(req.params.projectId);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const project = await Project_1.Project.findOne({ _id: projectId, members: userId });
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const tasks = await Task_1.Task.find({ projectId }).populate("assignedTo", "name email").sort({ createdAt: -1 });
    res.json({ tasks });
};
exports.getTasks = getTasks;
const updateTask = async (req, res) => {
    var _a;
    const { taskId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const body = updateTaskSchema.parse(req.body);
    const task = await Task_1.Task.findById(taskId);
    if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
    }
    const project = await Project_1.Project.findOne({ _id: task.projectId, members: userId });
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const role = (0, projectRole_1.getUserProjectRole)(project, String(userId));
    if (role !== "owner" && role !== "admin") {
        res.status(403).json({ message: "Only owner/admin can update tasks" });
        return;
    }
    if (body.title !== undefined)
        task.title = body.title;
    if (body.description !== undefined)
        task.description = body.description;
    if (body.status !== undefined)
        task.status = body.status;
    if (body.assignedTo !== undefined)
        task.assignedTo = body.assignedTo ? String(body.assignedTo) : null;
    if (body.dueDate !== undefined)
        task.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    await task.save();
    if (body.assignedTo) {
        await Notification_1.Notification.create({ userId: body.assignedTo, message: `You were assigned task: ${task.title}` });
    }
    await (0, activity_1.logActivity)({
        projectId: String(task.projectId),
        actor: String(userId),
        action: "updated task",
        entityType: "task",
        entityId: String(task._id),
        metadata: { status: task.status }
    });
    res.json({ task });
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    var _a;
    const { taskId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const task = await Task_1.Task.findById(taskId);
    if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
    }
    const project = await Project_1.Project.findOne({ _id: task.projectId, members: userId });
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const role = (0, projectRole_1.getUserProjectRole)(project, String(userId));
    if (role !== "owner" && role !== "admin") {
        res.status(403).json({ message: "Only owner/admin can delete tasks" });
        return;
    }
    await Task_1.Task.findByIdAndDelete(taskId);
    await (0, activity_1.logActivity)({
        projectId: String(task.projectId),
        actor: String(userId),
        action: "deleted task",
        entityType: "task",
        entityId: String(task._id),
        metadata: { title: task.title }
    });
    res.status(204).send();
};
exports.deleteTask = deleteTask;
