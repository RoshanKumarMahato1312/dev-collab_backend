import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
