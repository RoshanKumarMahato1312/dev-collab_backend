import { Router } from "express";
import { login, loginSchema, me, register, registerSchema, updateProfile } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, updateProfile);

export default router;
