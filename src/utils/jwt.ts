import jwt from "jsonwebtoken";

export const signToken = (payload: object, secret: string): string => {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};
