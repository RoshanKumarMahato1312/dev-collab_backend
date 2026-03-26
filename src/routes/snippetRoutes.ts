import { Router } from "express";
import { createSnippet, getSnippets } from "../controllers/snippetController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.post("/:projectId", createSnippet);
router.get("/:projectId", getSnippets);

export default router;
