"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/:projectId", chatController_1.getMessages);
exports.default = router;
