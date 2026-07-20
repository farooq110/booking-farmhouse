import { Router, Request, Response, NextFunction } from "express"
import { BookingsService } from "./bookings.service"
import { createBookingSchema, updateBookingStatusSchema, addPaymentSchema } from "./bookings.validation"
import { authenticate, RequestWithUser } from "../../common/middleware/authenticate"
import { authenticateOptional } from "../../common/middleware/authenticate-optional"
import { validate } from "../../common/middleware/validate"
import { ServiceModel } from "../../models/service.model"
import { BookingModel } from "../../models/booking.model"
import { sendSuccess } from "../../common/utils/response-utils"
import { HttpError } from "../../common/errors/http-error"

const bookingsRouter = Router()
const bookingsService = new BookingsService()

// 1. Public endpoint to create booking (customers)
bookingsRouter.post(
  "/",
  authenticateOptional,
  validate(createBookingSchema),
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const isAdmin = !!req.user
      const booking = await bookingsService.create(req.body, isAdmin)
      return sendSuccess(res, booking, 201)
    } catch (error) {
      return next(error)
    }
  },
)

// 2. Admin authentication required for the remaining routes
bookingsRouter.use(authenticate)

bookingsRouter.get(
  "/",
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { serviceId, status, date, search } = req.query

      if (!serviceId) {
        throw new HttpError(400, "serviceId query parameter is required")
      }

      // Verify ownership of the service
      const service = await ServiceModel.findById(serviceId)
      if (!service || service.owner_id.toString() !== req.user?.id) {
        throw new HttpError(403, "You do not have permission to view bookings for this service")
      }

      const bookings = await bookingsService.findAll(serviceId as string, {
        status: status as string,
        date: date as string,
        search: search as string,
      })

      return sendSuccess(res, bookings, 200)
    } catch (error) {
      return next(error)
    }
  },
)

bookingsRouter.get(
  "/:id",
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const bookingId = req.params.id

      // Lookup booking to check ownership of the associated service
      const booking = await BookingModel.findById(bookingId)
      if (!booking) {
        throw new HttpError(404, "Booking not found")
      }

      const service = await ServiceModel.findById(booking.service_id)
      if (!service || service.owner_id.toString() !== req.user?.id) {
        throw new HttpError(403, "You do not have permission to view this booking")
      }

      const bookingDetails = await bookingsService.findById(
        service._id.toString(),
        bookingId,
      )

      return sendSuccess(res, bookingDetails, 200)
    } catch (error) {
      return next(error)
    }
  },
)

bookingsRouter.post(
  "/:id/payments",
  validate(addPaymentSchema),
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const bookingId = req.params.id

      // Lookup booking to check ownership of the associated service
      const booking = await BookingModel.findById(bookingId)
      if (!booking) {
        throw new HttpError(404, "Booking not found")
      }

      const service = await ServiceModel.findById(booking.service_id)
      if (!service || service.owner_id.toString() !== req.user?.id) {
        throw new HttpError(403, "You do not have permission to manage this booking")
      }

      const updatedBooking = await bookingsService.addPayment(
        service._id.toString(),
        bookingId,
        req.body,
      )

      return sendSuccess(res, updatedBooking, 201)
    } catch (error) {
      return next(error)
    }
  },
)

bookingsRouter.patch(
  "/:id/status",
  validate(updateBookingStatusSchema),
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const bookingId = req.params.id
      const { status, reason } = req.body

      // Lookup booking to check ownership of the associated service
      const booking = await BookingModel.findById(bookingId)
      if (!booking) {
        throw new HttpError(404, "Booking not found")
      }

      const service = await ServiceModel.findById(booking.service_id)
      if (!service || service.owner_id.toString() !== req.user?.id) {
        throw new HttpError(403, "You do not have permission to manage this booking")
      }

      const updatedBooking = await bookingsService.updateStatus(
        service._id.toString(),
        bookingId,
        status,
        reason,
      )

      return sendSuccess(res, updatedBooking, 200)
    } catch (error) {
      return next(error)
    }
  },
)

bookingsRouter.delete(
  "/:id",
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const bookingId = req.params.id

      // Lookup booking to check ownership
      const booking = await BookingModel.findById(bookingId)
      if (!booking) {
        throw new HttpError(404, "Booking not found")
      }

      const service = await ServiceModel.findById(booking.service_id)
      if (!service || service.owner_id.toString() !== req.user?.id) {
        throw new HttpError(403, "You do not have permission to delete this booking")
      }

      await bookingsService.remove(service._id.toString(), bookingId)
      return sendSuccess(res, { message: "Booking successfully deleted" }, 200)
    } catch (error) {
      return next(error)
    }
  },
)

export { bookingsRouter }
