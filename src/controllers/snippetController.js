"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnippets = exports.createSnippet = void 0;
const zod_1 = require("zod");
const Project_1 = require("../models/Project");
const Snippet_1 = require("../models/Snippet");
const projectRole_1 = require("../utils/projectRole");
const activity_1 = require("../utils/activity");
const snippetSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    language: zod_1.z.string().min(1)
});
const createSnippet = async (req, res) => {
    var _a;
    const projectId = String(req.params.projectId);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const body = snippetSchema.parse(req.body);
    const project = await Project_1.Project.findOne({ _id: projectId, members: userId });
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const role = (0, projectRole_1.getUserProjectRole)(project, String(userId));
    if (role !== "owner" && role !== "admin") {
        res.status(403).json({ message: "Only owner/admin can create snippets" });
        return;
    }
    const snippet = await Snippet_1.Snippet.create({
        code: body.code,
        language: body.language,
        projectId,
        createdBy: userId
    });
    await (0, activity_1.logActivity)({
        projectId,
        actor: String(userId),
        action: "shared snippet",
        entityType: "snippet",
        entityId: String(snippet._id),
        metadata: { language: snippet.language }
    });
    res.status(201).json({ snippet });
};
exports.createSnippet = createSnippet;
const getSnippets = async (req, res) => {
    var _a;
    const projectId = String(req.params.projectId);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const project = await Project_1.Project.findOne({ _id: projectId, members: userId });
    if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
    }
    const snippets = await Snippet_1.Snippet.find({ projectId }).populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json({ snippets });
};
exports.getSnippets = getSnippets;
