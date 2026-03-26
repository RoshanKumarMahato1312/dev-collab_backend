import { Router } from "express";
import { getMessages } from "../controllers/chatController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.get("/:projectId", getMessages);

export default router;
