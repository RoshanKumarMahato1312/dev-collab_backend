"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeProject = exports.updateMemberRole = exports.inviteUser = exports.getProjectById = exports.getProjects = exports.createProject = exports.inviteSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
const Project_1 = require("../models/Project");
const Notification_1 = require("../models/Notification");
const projectRole_1 = require("../utils/projectRole");
const activity_1 = require("../utils/activity");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().optional().default("")
});
exports.inviteSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
    role: zod_1.z.enum(["admin", "member"]).optional().default("member")
});
const createProject = async (req, res) => {
    var _a;
    const { name, description } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const project = await Project_1.Project.create({
        name,
        description,
        owner: String(userId),
        members: [String(userId)],
        memberRoles: [{ user: String(userId), role: "admin" }]
    });
    await (0, activity_1.logActivity)({
        projectId: String(project._id),
        actor: String(userId),
        action: "created project",
        entityType: "project",
        entityId: String(project._id),
        metadata: { projectName: project.name }
    });
    res.status(201).json({ project });
};
exports.createProject = createProject;
const getProjects = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const projects = await Project_1.Project.find({ members: userId })
        .populate("owner", "name email")
        .populate("memberRoles.user", "name email")
        .sort({ updatedAt: -1 });
    const enrichedProjects = projects.map((project) => ({
        ...project.toObject(),
        currentUserRole: (0, projectRole_1.getUserProjectRole)(project, String(userId))
    }));
    res.json({ projects: enrichedProjects });
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    var _a;
    const { projectId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const project = await Project_1.Project.findOne({ _id: projectId, members: userId })
        .populate("owner", "name email")
        .populate("members", "name email")
        .populate("memberRoles.user", "name email");
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const currentUserRole = (0, projectRole_1.getUserProjectRole)(project, String(userId));
    res.json({ project, currentUserRole });
};
exports.getProjectById = getProjectById;
const inviteUser = async (req, res) => {
    var _a;
    const { projectId } = req.params;
    const { userId, role } = req.body;
    const requesterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!requesterId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const project = await Project_1.Project.findById(projectId);
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const requesterRole = (0, projectRole_1.getUserProjectRole)(project, String(requesterId));
    if (requesterRole !== "owner" && requesterRole !== "admin") {
        res.status(403).json({ message: "Only owner/admin can invite members" });
        return;
    }
    const alreadyMember = project.members.some((member) => String(member) === userId);
    if (!alreadyMember) {
        project.members.push(userId);
        project.memberRoles.push({ user: userId, role });
        await project.save();
        await Notification_1.Notification.create({ userId, message: `You were added to project ${project.name}` });
        await (0, activity_1.logActivity)({
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
exports.inviteUser = inviteUser;
const updateMemberRole = async (req, res) => {
    var _a;
    const { projectId, userId } = req.params;
    const body = zod_1.z.object({ role: zod_1.z.enum(["admin", "member"]) }).parse(req.body);
    const requesterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!requesterId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const project = await Project_1.Project.findById(projectId);
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    if (String(project.owner) !== String(requesterId)) {
        res.status(403).json({ message: "Only owner can change roles" });
        return;
    }
    const target = project.memberRoles.find((entry) => String(entry.user) === String(userId));
    if (!target) {
        res.status(404).json({ message: "Member role not found" });
        return;
    }
    target.role = body.role;
    await project.save();
    await (0, activity_1.logActivity)({
        projectId: String(project._id),
        actor: String(requesterId),
        action: `changed member role to ${body.role}`,
        entityType: "project-member",
        entityId: String(userId),
        metadata: { role: body.role }
    });
    res.json({ project });
};
exports.updateMemberRole = updateMemberRole;
const completeProject = async (req, res) => {
    var _a;
    const { projectId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const project = await Project_1.Project.findOne({ _id: projectId, members: userId });
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const role = (0, projectRole_1.getUserProjectRole)(project, String(userId));
    if (role !== "owner" && role !== "admin") {
        res.status(403).json({ message: "Only owner/admin can complete project" });
        return;
    }
    if (project.status !== "completed") {
        project.status = "completed";
        project.completedAt = new Date();
        project.completedBy = String(userId);
        await project.save();
        await (0, activity_1.logActivity)({
            projectId: String(project._id),
            actor: String(userId),
            action: "completed project",
            entityType: "project",
            entityId: String(project._id)
        });
    }
    res.json({ project });
};
exports.completeProject = completeProject;
