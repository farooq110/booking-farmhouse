import { Router, Response, NextFunction } from "express"
import { ServicesService } from "./services.service"
import { createServiceSchema, updateServiceSchema } from "./services.validation"
import { authenticate, RequestWithUser } from "../../common/middleware/authenticate"
import { validate } from "../../common/middleware/validate"
import { ownershipGuard } from "../../common/guards/ownership-guard"
import { sendSuccess } from "../../common/utils/response-utils"
import { HttpError } from "../../common/errors/http-error"

const servicesRouter = Router()
const servicesService = new ServicesService()

// Apply authentication to all service routes
servicesRouter.use(authenticate)

servicesRouter.get(
  "/",
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user?.id
      if (!ownerId) {
        throw new HttpError(401, "Unauthorized")
      }
      const services = await servicesService.findAllByOwner(ownerId)
      return sendSuccess(res, services, 200)
    } catch (error) {
      return next(error)
    }
  },
)

servicesRouter.post(
  "/",
  validate(createServiceSchema),
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user?.id
      if (!ownerId) {
        throw new HttpError(401, "Unauthorized")
      }
      const service = await servicesService.create(ownerId, req.body)
      return sendSuccess(res, service, 201)
    } catch (error) {
      return next(error)
    }
  },
)

servicesRouter.get(
  "/:id",
  ownershipGuard,
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const service = await servicesService.findOne(req.params.id)
      return sendSuccess(res, service, 200)
    } catch (error) {
      return next(error)
    }
  },
)

servicesRouter.patch(
  "/:id",
  ownershipGuard,
  validate(updateServiceSchema),
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const service = await servicesService.update(req.params.id, req.body)
      return sendSuccess(res, service, 200)
    } catch (error) {
      return next(error)
    }
  },
)

servicesRouter.delete(
  "/:id",
  ownershipGuard,
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const service = await servicesService.remove(req.params.id)
      return sendSuccess(res, service, 200)
    } catch (error) {
      return next(error)
    }
  },
)

export { servicesRouter }
