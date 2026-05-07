"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Snippet = void 0;
const mongoose_1 = require("mongoose");
const snippetSchema = new mongoose_1.Schema({
    code: { type: String, required: true },
    language: { type: String, required: true, trim: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
exports.Snippet = (0, mongoose_1.model)("Snippet", snippetSchema);
