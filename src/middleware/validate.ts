import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      return;
    }
    req.body = parsed.data;
    next();
  };
};
