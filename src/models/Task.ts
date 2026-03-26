import { Schema, model } from "mongoose";

export type TaskStatus = "todo" | "in-progress" | "done";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    dueDate: { type: Date, default: null },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true }
  },
  { timestamps: true }
);

export const Task = model<any>("Task", taskSchema);
