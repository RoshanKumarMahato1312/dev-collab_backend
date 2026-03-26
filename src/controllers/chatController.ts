import type { Request, Response } from "express";
import { Project } from "../models/Project";
import { Message } from "../models/Message";

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.id;

  const project = await Project.findOne({ _id: projectId, members: userId });
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const messages = await Message.find({ projectId }).populate("sender", "name email").sort({ createdAt: 1 });
  res.json({ messages });
};
