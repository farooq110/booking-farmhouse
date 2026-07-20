import { Router, Request, Response, NextFunction } from "express"
import { AvailabilityService } from "./availability.service"
import { updateScheduleSchema, createOverrideSchema } from "./availability.validation"
import { authenticate, RequestWithUser } from "../../common/middleware/authenticate"
import { validate } from "../../common/middleware/validate"
import { ownershipGuard } from "../../common/guards/ownership-guard"
import { sendSuccess } from "../../common/utils/response-utils"
import { HttpError } from "../../common/errors/http-error"

const availabilityRouter = Router()
const availabilityService = new AvailabilityService()

// Public route for customer calendar
availabilityRouter.get(
  "/:serviceId/calendar",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params
      const { startDate, endDate } = req.query

      if (!startDate || !endDate) {
        throw new HttpError(400, "startDate and endDate query parameters are required")
      }

      const calendar = await availabilityService.getCalendar(
        serviceId,
        startDate as string,
        endDate as string,
      )

      return sendSuccess(res, calendar, 200)
    } catch (error) {
      return next(error)
    }
  },
)

// Admin-only routes (authenticated + ownership checked)
availabilityRouter.use("/:serviceId", authenticate, ownershipGuard)

availabilityRouter.get(
  "/:serviceId/schedule",
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const schedule = await availabilityService.getSchedule(req.params.serviceId)
      return sendSuccess(res, schedule, 200)
    } catch (error) {
      return next(error)
    }
  },
)

availabilityRouter.put(
  "/:serviceId/schedule",
  validate(updateScheduleSchema),
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const schedule = await availabilityService.updateSchedule(req.params.serviceId, req.body)
      return sendSuccess(res, schedule, 200)
    } catch (error) {
      return next(error)
    }
  },
)

availabilityRouter.get(
  "/:serviceId/overrides",
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const overrides = await availabilityService.getOverrides(req.params.serviceId)
      return sendSuccess(res, overrides, 200)
    } catch (error) {
      return next(error)
    }
  },
)

availabilityRouter.post(
  "/:serviceId/overrides",
  validate(createOverrideSchema),
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const override = await availabilityService.createOverride(req.params.serviceId, req.body)
      return sendSuccess(res, override, 201)
    } catch (error) {
      return next(error)
    }
  },
)

availabilityRouter.delete(
  "/:serviceId/overrides/:id",
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { serviceId, id } = req.params
      const override = await availabilityService.deleteOverride(serviceId, id)
      return sendSuccess(res, override, 200)
    } catch (error) {
      return next(error)
    }
  },
)

export { availabilityRouter }
