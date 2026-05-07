"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.me = exports.login = exports.register = exports.loginSchema = exports.registerSchema = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
const register = async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await User_1.User.findOne({ email });
    if (existing) {
        res.status(409).json({ message: "Email already registered" });
        return;
    }
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.User.create({ name, email, password: hashed });
    const token = (0, jwt_1.signToken)({ id: user._id }, env_1.env.jwtSecret);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }
    const match = await bcryptjs_1.default.compare(password, user.password);
    if (!match) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }
    const token = (0, jwt_1.signToken)({ id: user._id }, env_1.env.jwtSecret);
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
};
exports.login = login;
const me = async (req, res) => {
    var _a;
    const user = await User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select("_id name email createdAt updatedAt");
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json({ user });
};
exports.me = me;
const updateProfile = async (req, res) => {
    var _a;
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        email: zod_1.z.string().email().optional()
    });
    const body = schema.parse(req.body);
    const user = await User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    if (body.email && body.email !== user.email) {
        const exists = await User_1.User.findOne({ email: body.email });
        if (exists) {
            res.status(409).json({ message: "Email already in use" });
            return;
        }
    }
    if (body.name !== undefined)
        user.name = body.name;
    if (body.email !== undefined)
        user.email = body.email;
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
};
exports.updateProfile = updateProfile;
