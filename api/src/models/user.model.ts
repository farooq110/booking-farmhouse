import { Schema, model } from "mongoose"

export interface User {
  name: string
  email: string
  password_hash: string
  role: "admin" | "staff"
  refresh_token?: string
  created_at: Date
  updated_at: Date
}

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "admin",
    },
    refresh_token: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const UserModel = model<User>("User", userSchema)
