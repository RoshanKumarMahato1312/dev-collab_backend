import type { Request, Response } from "express";
import { z } from "zod";
import { Task } from "../models/Task";
import { Project } from "../models/Project";
import { Notification } from "../models/Notification";
import { getUserProjectRole } from "../utils/projectRole";
import { logActivity } from "../utils/activity";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assignedTo: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional()
});

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const projectId = String(req.params.projectId);
  const userId = req.user?.id;
  const body = taskSchema.parse(req.body);

  const project = await Project.findOne({ _id: projectId, members: userId });
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const role = getUserProjectRole(project, String(userId));
  if (role === "none") {
    res.status(403).json({ message: "Only project members can create tasks" });
    return;
  }

  const task = await Task.create({
    title: body.title,
    description: body.description,
    assignedTo: body.assignedTo ? String(body.assignedTo) : null,
    dueDate: body.dueDate ? new Date(body.dueDate) : null,
    projectId
  });

  if (body.assignedTo) {
    await Notification.create({ userId: body.assignedTo, message: `You were assigned task: ${body.title}` });
  }

  await logActivity({
    projectId,
    actor: String(userId),
    action: "created task",
    entityType: "task",
    entityId: String(task._id),
    metadata: { title: task.title }
  });

  res.status(201).json({ task });
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const projectId = String(req.params.projectId);
  const userId = req.user?.id;

  const project = await Project.findOne({ _id: projectId, members: userId });
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const tasks = await Task.find({ projectId }).populate("assignedTo", "name email").sort({ createdAt: -1 });
  res.json({ tasks });
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const userId = req.user?.id;
  const body = updateTaskSchema.parse(req.body);

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const project = await Project.findOne({ _id: task.projectId, members: userId });
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const role = getUserProjectRole(project, String(userId));
  if (role !== "owner" && role !== "admin") {
    res.status(403).json({ message: "Only owner/admin can update tasks" });
    return;
  }

  if (body.title !== undefined) task.title = body.title;
  if (body.description !== undefined) task.description = body.description;
  if (body.status !== undefined) task.status = body.status;
  if (body.assignedTo !== undefined) task.assignedTo = body.assignedTo ? (String(body.assignedTo) as never) : null;
  if (body.dueDate !== undefined) task.dueDate = body.dueDate ? new Date(body.dueDate) : null;

  await task.save();

  if (body.assignedTo) {
    await Notification.create({ userId: body.assignedTo, message: `You were assigned task: ${task.title}` });
  }

  await logActivity({
    projectId: String(task.projectId),
    actor: String(userId),
    action: "updated task",
    entityType: "task",
    entityId: String(task._id),
    metadata: { status: task.status }
  });

  res.json({ task });
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const userId = req.user?.id;
  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const project = await Project.findOne({ _id: task.projectId, members: userId });
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const role = getUserProjectRole(project, String(userId));
  if (role !== "owner" && role !== "admin") {
    res.status(403).json({ message: "Only owner/admin can delete tasks" });
    return;
  }

  await Task.findByIdAndDelete(taskId);
  await logActivity({
    projectId: String(task.projectId),
    actor: String(userId),
    action: "deleted task",
    entityType: "task",
    entityId: String(task._id),
    metadata: { title: task.title }
  });

  res.status(204).send();
};
