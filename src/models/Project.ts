import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    completedAt: { type: Date, default: null },
    completedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    memberRoles: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["admin", "member"], default: "member" }
      }
    ]
  },
  { timestamps: true }
);

export const Project = model<any>("Project", projectSchema);
