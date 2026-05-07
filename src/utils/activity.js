"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const Activity_1 = require("../models/Activity");
const logActivity = async (payload) => {
    var _a, _b;
    await Activity_1.Activity.create({
        projectId: payload.projectId,
        actor: payload.actor,
        action: payload.action,
        entityType: payload.entityType,
        entityId: (_a = payload.entityId) !== null && _a !== void 0 ? _a : "",
        metadata: (_b = payload.metadata) !== null && _b !== void 0 ? _b : {}
    });
};
exports.logActivity = logActivity;
