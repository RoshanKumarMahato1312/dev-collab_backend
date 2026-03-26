import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { env } from "../config/env";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ message: "Email already registered" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  const token = signToken({ id: user._id }, env.jwtSecret);

  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = signToken({ id: user._id }, env.jwtSecret);
  res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.id).select("_id name email createdAt updatedAt");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional()
  });

  const body = schema.parse(req.body);
  const user = await User.findById(req.user?.id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (body.email && body.email !== user.email) {
    const exists = await User.findOne({ email: body.email });
    if (exists) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }
  }

  if (body.name !== undefined) user.name = body.name;
  if (body.email !== undefined) user.email = body.email;

  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email } });
};
