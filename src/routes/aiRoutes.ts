import { Router } from "express";
import { explainCode, generateCode } from "../controllers/aiController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.post("/explain", explainCode);
router.post("/generate", generateCode);

export default router;
