import type { Request, Response } from "express";
import { Activity } from "../models/Activity";
import { Project } from "../models/Project";

export const getProjectActivity = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.id;

  const project = await Project.findOne({ _id: projectId, members: userId });
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const activities = await Activity.find({ projectId })
    .populate("actor", "name email")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ activities });
};
