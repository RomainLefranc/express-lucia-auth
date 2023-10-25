import { KeyDoc } from "@lucia-auth/adapter-mongoose/dist/docs";
import { Schema, model } from "mongoose";

interface IKey extends KeyDoc {}

const keySchema = new Schema<IKey>(
  {
    _id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    hashed_password: String,
  } as const,
  { _id: false }
);

const keyModel = model("Key", keySchema);

export default keyModel;
