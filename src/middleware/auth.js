"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
        res.status(401).json({ message: "Missing token" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        req.user = { id: decoded.id };
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
