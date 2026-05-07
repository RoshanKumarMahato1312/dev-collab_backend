"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const mongoose_1 = require("mongoose");
const activitySchema = new mongoose_1.Schema({
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true },
    actor: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, default: "" },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
exports.Activity = (0, mongoose_1.model)("Activity", activitySchema);
