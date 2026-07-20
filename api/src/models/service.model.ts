import { Schema, model, Types } from "mongoose"

export interface Service {
  owner_id: Types.ObjectId
  name: string
  description: string
  location?: string
  currency: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

const serviceSchema = new Schema<Service>(
  {
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const ServiceModel = model<Service>("Service", serviceSchema)
