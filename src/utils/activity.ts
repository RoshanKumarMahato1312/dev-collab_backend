import { Activity } from "../models/Activity";

interface LogActivityInput {
  projectId: string;
  actor: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export const logActivity = async (payload: LogActivityInput): Promise<void> => {
  await Activity.create({
    projectId: payload.projectId,
    actor: payload.actor,
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId ?? "",
    metadata: payload.metadata ?? {}
  });
};
