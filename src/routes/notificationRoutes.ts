import { Router } from "express";
import { getNotifications, markNotificationRead } from "../controllers/notificationController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.get("/", getNotifications);
router.patch("/:notificationId/read", markNotificationRead);

export default router;
