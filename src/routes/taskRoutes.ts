import { Router } from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/taskController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.post("/:projectId", createTask);
router.get("/:projectId", getTasks);
router.patch("/item/:taskId", updateTask);
router.delete("/item/:taskId", deleteTask);

export default router;
