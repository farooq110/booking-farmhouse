import { Schema, model, Types } from "mongoose"

import { TimeSlot, timeSlotSchema } from "./availability-schedule.model"

export interface AvailabilityOverride {
  service_id: Types.ObjectId
  date: string // YYYY-MM-DD
  entire_day_off: boolean
  custom_slots: TimeSlot[]
  label: string
  created_at: Date
  updated_at: Date
}

const availabilityOverrideSchema = new Schema<AvailabilityOverride>(
  {
    service_id: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    entire_day_off: {
      type: Boolean,
      required: true,
      default: false,
    },
    custom_slots: {
      type: [timeSlotSchema],
      default: [],
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

// Compound index for unique overrides per service per date
availabilityOverrideSchema.index({ service_id: 1, date: 1 }, { unique: true })

export const AvailabilityOverrideModel = model<AvailabilityOverride>(
  "AvailabilityOverride",
  availabilityOverrideSchema,
)
