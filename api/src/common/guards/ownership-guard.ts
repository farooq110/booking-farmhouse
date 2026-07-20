import { Response, NextFunction } from "express"
import { RequestWithUser } from "../middleware/authenticate"
import { ServiceModel } from "../../models/service.model"
import { HttpError } from "../errors/http-error"

export const ownershipGuard = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id
  const serviceId = req.params.serviceId || req.params.id

  if (!userId) {
    return next(new HttpError(401, "Unauthorized"))
  }

  if (!serviceId) {
    return next(new HttpError(400, "Service ID is required"))
  }

  try {
    const service = await ServiceModel.findById(serviceId)
    if (!service) {
      return next(new HttpError(404, "Service not found"))
    }

    if (service.owner_id.toString() !== userId) {
      return next(new HttpError(403, "You do not have permission to manage this service"))
    }

    return next()
  } catch (error) {
    return next(error)
  }
}
