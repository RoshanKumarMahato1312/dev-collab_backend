"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    text: { type: String, required: true, trim: true },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true }
}, { timestamps: true });
exports.Message = (0, mongoose_1.model)("Message", messageSchema);
