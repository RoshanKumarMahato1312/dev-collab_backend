import { Schema, model } from "mongoose";

const snippetSchema = new Schema(
  {
    code: { type: String, required: true },
    language: { type: String, required: true, trim: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Snippet = model<any>("Snippet", snippetSchema);
