import { UserDoc } from "@lucia-auth/adapter-mongoose/dist/docs";
import { Schema, model } from "mongoose";

interface IUser extends UserDoc {
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailIsVerified: boolean;
  verificationToken: string | null;
}

const userSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
    },
    firstName: String,
    lastName: String,
    emailIsVerified: Boolean,
    verificationToken: String,
  } as const,
  { _id: false }
);

export const userModel = model("User", userSchema);
