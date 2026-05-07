"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProjectForMember = exports.getUserProjectRole = void 0;
const Project_1 = require("../models/Project");
const getUserProjectRole = (project, userId) => {
    var _a, _b, _c;
    const ownerId = typeof project.owner === "object" && ((_a = project.owner) === null || _a === void 0 ? void 0 : _a._id) ? String(project.owner._id) : String(project.owner);
    if (ownerId === String(userId))
        return "owner";
    const roleEntry = ((_b = project.memberRoles) !== null && _b !== void 0 ? _b : []).find((item) => String(item.user) === String(userId));
    if ((roleEntry === null || roleEntry === void 0 ? void 0 : roleEntry.role) === "admin")
        return "admin";
    if ((roleEntry === null || roleEntry === void 0 ? void 0 : roleEntry.role) === "member")
        return "member";
    const isMember = ((_c = project.members) !== null && _c !== void 0 ? _c : []).some((member) => {
        const memberId = typeof member === "object" && (member === null || member === void 0 ? void 0 : member._id) ? String(member._id) : String(member);
        return memberId === String(userId);
    });
    if (isMember)
        return "member";
    return "none";
};
exports.getUserProjectRole = getUserProjectRole;
const findProjectForMember = async (projectId, userId) => {
    return Project_1.Project.findOne({ _id: projectId, members: userId });
};
exports.findProjectForMember = findProjectForMember;
