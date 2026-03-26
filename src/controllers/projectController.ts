import type { Request, Response } from "express";
import { z } from "zod";
import { Project } from "../models/Project";
import { Notification } from "../models/Notification";
import { getUserProjectRole } from "../utils/projectRole";
import { logActivity } from "../utils/activity";

export const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default("")
});

export const inviteSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "member"]).optional().default("member")
});

export const createProject = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body as z.infer<typeof createProjectSchema>;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const project = await Project.create({
    name,
    description,
    owner: String(userId),
    members: [String(userId)],
    memberRoles: [{ user: String(userId), role: "admin" }]
  });

  await logActivity({
    projectId: String(project._id),
    actor: String(userId),
    action: "created project",
    entityType: "project",
    entityId: String(project._id),
    metadata: { projectName: project.name }
  });

  res.status(201).json({ project });
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const projects = await Project.find({ members: userId })
    .populate("owner", "name email")
    .populate("memberRoles.user", "name email")
    .sort({ updatedAt: -1 });

  const enrichedProjects = projects.map((project: any) => ({
    ...project.toObject(),
    currentUserRole: getUserProjectRole(project, String(userId))
  }));
  res.json({ projects: enrichedProjects });
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const project = await Project.findOne({ _id: projectId, members: userId })
    .populate("owner", "name email")
    .populate("members", "name email")
    .populate("memberRoles.user", "name email");

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const currentUserRole = getUserProjectRole(project, String(userId));
  res.json({ project, currentUserRole });
};

export const inviteUser = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const { userId, role } = req.body as z.infer<typeof inviteSchema>;
  const requesterId = req.user?.id;
  if (!requesterId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const requesterRole = getUserProjectRole(project, String(requesterId));
  if (requesterRole !== "owner" && requesterRole !== "admin") {
    res.status(403).json({ message: "Only owner/admin can invite members" });
    return;
  }

  const alreadyMember = project.members.some((member: unknown) => String(member) === userId);
  if (!alreadyMember) {
    project.members.push(userId as never);
    project.memberRoles.push({ user: userId, role } as never);
    await project.save();
    await Notification.create({ userId, message: `You were added to project ${project.name}` });
    await logActivity({
      projectId: String(project._id),
      actor: String(requesterId),
      action: `invited user as ${role}`,
      entityType: "project-member",
      entityId: userId,
      metadata: { invitedUserId: userId, role }
    });
  }

  res.json({ project });
};

export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
  const { projectId, userId } = req.params;
  const body = z.object({ role: z.enum(["admin", "member"]) }).parse(req.body);
  const requesterId = req.user?.id;

  if (!requesterId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  if (String(project.owner) !== String(requesterId)) {
    res.status(403).json({ message: "Only owner can change roles" });
    return;
  }

  const target = project.memberRoles.find((entry: any) => String(entry.user) === String(userId));
  if (!target) {
    res.status(404).json({ message: "Member role not found" });
    return;
  }

  target.role = body.role;
  await project.save();

  await logActivity({
    projectId: String(project._id),
    actor: String(requesterId),
    action: `changed member role to ${body.role}`,
    entityType: "project-member",
    entityId: String(userId),
    metadata: { role: body.role }
  });

  res.json({ project });
};

export const completeProject = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const project = await Project.findOne({ _id: projectId, members: userId });
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const role = getUserProjectRole(project, String(userId));
  if (role !== "owner" && role !== "admin") {
    res.status(403).json({ message: "Only owner/admin can complete project" });
    return;
  }

  if (project.status !== "completed") {
    project.status = "completed";
    project.completedAt = new Date();
    project.completedBy = String(userId);
    await project.save();

    await logActivity({
      projectId: String(project._id),
      actor: String(userId),
      action: "completed project",
      entityType: "project",
      entityId: String(project._id)
    });
  }

  res.json({ project });
};
