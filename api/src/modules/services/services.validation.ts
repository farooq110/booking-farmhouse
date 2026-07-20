import { z } from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  location: z.string().optional(),
  currency: z.string().min(3).max(5).default("USD"),
})

export const updateServiceSchema = createServiceSchema.partial().extend({
  is_active: z.boolean().optional(),
})

export type CreateServiceDto = z.infer<typeof createServiceSchema>
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>
