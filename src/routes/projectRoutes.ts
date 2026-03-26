import { Router } from "express";
import { completeProject, createProject, createProjectSchema, getProjectById, getProjects, inviteSchema, inviteUser, updateMemberRole } from "../controllers/projectController";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const router = Router();

router.use(authMiddleware);
router.post("/", validateBody(createProjectSchema), createProject);
router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.post("/:projectId/invite", validateBody(inviteSchema), inviteUser);
router.patch("/:projectId/members/:userId/role", updateMemberRole);
router.patch("/:projectId/complete", completeProject);

export default router;
