"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activityController_1 = require("../controllers/activityController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/:projectId", activityController_1.getProjectActivity);
exports.default = router;
