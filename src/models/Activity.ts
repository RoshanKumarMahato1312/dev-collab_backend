import { Schema, model } from "mongoose";

const activitySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const Activity = model<any>("Activity", activitySchema);
