import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true }
  },
  { timestamps: true }
);

export const Message = model<any>("Message", messageSchema);
