import type { Request, Response } from "express";
import { z } from "zod";
import { Project } from "../models/Project";
import { Snippet } from "../models/Snippet";
import { getUserProjectRole } from "../utils/projectRole";
import { logActivity } from "../utils/activity";

const snippetSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1)
});

export const createSnippet = async (req: Request, res: Response): Promise<void> => {
  const projectId = String(req.params.projectId);
  const userId = req.user?.id;
  const body = snippetSchema.parse(req.body);

  const project = await Project.findOne({ _id: projectId, members: userId });
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const role = getUserProjectRole(project, String(userId));
  if (role !== "owner" && role !== "admin") {
    res.status(403).json({ message: "Only owner/admin can create snippets" });
    return;
  }

  const snippet = await Snippet.create({
    code: body.code,
    language: body.language,
    projectId,
    createdBy: userId
  });

  await logActivity({
    projectId,
    actor: String(userId),
    action: "shared snippet",
    entityType: "snippet",
    entityId: String(snippet._id),
    metadata: { language: snippet.language }
  });

  res.status(201).json({ snippet });
};

export const getSnippets = async (req: Request, res: Response): Promise<void> => {
  const projectId = String(req.params.projectId);
  const userId = req.user?.id;

  const project = await Project.findOne({ _id: projectId, members: userId });
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const snippets = await Snippet.find({ projectId }).populate("createdBy", "name email").sort({ createdAt: -1 });
  res.json({ snippets });
};
