import { Schema, model, Types } from "mongoose"

export interface TimeSlot {
  start: string
  end: string
  price: number
}

export interface DaySchedule {
  enabled: boolean
  slots: TimeSlot[]
}

export interface AvailabilitySchedule {
  service_id: Types.ObjectId
  schedule: {
    mon: DaySchedule
    tue: DaySchedule
    wed: DaySchedule
    thu: DaySchedule
    fri: DaySchedule
    sat: DaySchedule
    sun: DaySchedule
  }
  created_at: Date
  updated_at: Date
}

export const timeSlotSchema = new Schema<TimeSlot>(
  {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
)

const dayScheduleSchema = new Schema<DaySchedule>(
  {
    enabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    slots: {
      type: [timeSlotSchema],
      default: [],
    },
  },
  { _id: false },
)

const availabilityScheduleSchema = new Schema<AvailabilitySchedule>(
  {
    service_id: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      unique: true,
      index: true,
    },
    schedule: {
      mon: { type: dayScheduleSchema, default: () => ({ enabled: false, slots: [] }) },
      tue: { type: dayScheduleSchema, default: () => ({ enabled: false, slots: [] }) },
      wed: { type: dayScheduleSchema, default: () => ({ enabled: false, slots: [] }) },
      thu: { type: dayScheduleSchema, default: () => ({ enabled: false, slots: [] }) },
      fri: { type: dayScheduleSchema, default: () => ({ enabled: false, slots: [] }) },
      sat: { type: dayScheduleSchema, default: () => ({ enabled: false, slots: [] }) },
      sun: { type: dayScheduleSchema, default: () => ({ enabled: false, slots: [] }) },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const AvailabilityScheduleModel = model<AvailabilitySchedule>(
  "AvailabilitySchedule",
  availabilityScheduleSchema,
)
