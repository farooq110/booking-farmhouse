import { Request, Response, NextFunction } from "express"
import { ZodSchema } from "zod"
import { HttpError } from "../errors/http-error"

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => {
        return `${err.path.join(".")}: ${err.message}`
      }).join(", ")
      return next(new HttpError(400, `Validation failed - ${errorMessages}`))
    }
    req.body = result.data
    return next()
  }
}
