import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

import { authRouter } from "./modules/auth/auth.router"
import { servicesRouter } from "./modules/services/services.router"
import { availabilityRouter } from "./modules/availability/availability.router"
import { bookingsRouter } from "./modules/bookings/bookings.router"
import { sendError, sendSuccess } from "./common/utils/response-utils"
import { HttpError } from "./common/errors/http-error"

const app = express()

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(express.json())

app.get("/health", (req: Request, res: Response) => {
  return sendSuccess(res, { status: "OK", timestamp: new Date().toISOString() })
})

const apiRouter = express.Router()
app.use("/api", apiRouter)

apiRouter.use("/auth", authRouter)
apiRouter.use("/services", servicesRouter)
apiRouter.use("/availability", availabilityRouter)
apiRouter.use("/bookings", bookingsRouter)


// Global Error Handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const status = err instanceof HttpError ? err.status : 500
  const message = err instanceof Error ? err.message : "Internal Server Error"

  // Log unexpected errors
  if (status === 500) {
    console.error("Internal Server Error:", err)
  }

  return sendError(res, message, status)
})

export { app }