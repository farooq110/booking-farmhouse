import { z } from "zod"

const timeSlotSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be HH:mm format"),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be HH:mm format"),
  price: z.number().min(0, "Price cannot be negative"),
})

const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  slots: z.array(timeSlotSchema),
})

export const updateScheduleSchema = z.object({
  schedule: z.object({
    mon: dayScheduleSchema,
    tue: dayScheduleSchema,
    wed: dayScheduleSchema,
    thu: dayScheduleSchema,
    fri: dayScheduleSchema,
    sat: dayScheduleSchema,
    sun: dayScheduleSchema,
  }),
})

export const createOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  entire_day_off: z.boolean(),
  custom_slots: z.array(timeSlotSchema).default([]),
  label: z.string().min(1, "Label is required"),
})

export type UpdateScheduleDto = z.infer<typeof updateScheduleSchema>
export type CreateOverrideDto = z.infer<typeof createOverrideSchema>
