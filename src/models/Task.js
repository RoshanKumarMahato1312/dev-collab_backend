"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
    dueDate: { type: Date, default: null },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true }
}, { timestamps: true });
exports.Task = (0, mongoose_1.model)("Task", taskSchema);
