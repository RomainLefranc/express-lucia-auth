import { Schema, model } from "mongoose";

interface IPasswordResetToken {
  _id: string;
  expires: number;
  user_id: string;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    _id: {
      type: String,
      required: true,
    },
    expires: {
      type: Number,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
  } as const,
  { _id: true }
);

export const passwordResetTokenModel = model(
  "passwordResetToken",
  passwordResetTokenSchema
);
