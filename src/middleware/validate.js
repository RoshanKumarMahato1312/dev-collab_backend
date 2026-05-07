"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const validateBody = (schema) => {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
            return;
        }
        req.body = parsed.data;
        next();
    };
};
exports.validateBody = validateBody;
