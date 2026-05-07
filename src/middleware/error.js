"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ message });
};
exports.errorHandler = errorHandler;
