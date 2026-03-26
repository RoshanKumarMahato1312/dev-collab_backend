import { Router } from "express";
import { getProjectActivity } from "../controllers/activityController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.get("/:projectId", getProjectActivity);

export default router;
