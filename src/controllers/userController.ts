import type { Request, Response } from "express";
import { User } from "../models/User";

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  const query = (req.query.query as string | undefined)?.trim();

  if (!query) {
    res.json({ users: [] });
    return;
  }

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } }
    ]
  })
    .select("_id name email")
    .limit(10);

  res.json({ users });
};
