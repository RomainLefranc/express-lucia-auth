import { SessionDoc } from "@lucia-auth/adapter-mongoose/dist/docs";
import { Schema, model } from "mongoose";

interface ISession extends SessionDoc {}

const sessionSchema = new Schema<ISession>(
  {
    _id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    active_expires: {
      type: Number,
      required: true,
    },
    idle_expires: {
      type: Number,
      required: true,
    },
  } as const,
  { _id: false }
);

const sessionModel = model("Session", sessionSchema);

export default sessionModel;
