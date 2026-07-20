import { z } from "zod"

export const createBookingSchema = z.object({
  service_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid service_id format"),
  customer: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.union([z.literal(""), z.string().email("Invalid email address")]).optional(),
    phone: z.string().min(6, "Phone number is too short"),
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  slot: z.object({
    label: z.string().optional(),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be HH:mm"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be HH:mm"),
  }),
  notes: z.string().optional(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
  reason: z.string().optional(),
})

export const addPaymentSchema = z.object({
  amount: z.number().min(0, "Amount must be at least 0"),
  payment_number: z.string().min(1, "Payment number is required"),
  type: z.enum(["advance", "full"]),
  method: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
})

export type CreateBookingDto = z.infer<typeof createBookingSchema>
export type UpdateBookingStatusDto = z.infer<typeof updateBookingStatusSchema>
export type AddPaymentDto = z.infer<typeof addPaymentSchema>

