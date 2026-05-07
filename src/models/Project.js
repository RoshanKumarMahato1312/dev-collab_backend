"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const projectSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    completedAt: { type: Date, default: null },
    completedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    memberRoles: [
        {
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
            role: { type: String, enum: ["admin", "member"], default: "member" }
        }
    ]
}, { timestamps: true });
exports.Project = (0, mongoose_1.model)("Project", projectSchema);
