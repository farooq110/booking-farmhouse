import { Types } from "mongoose"
import { BookingModel, Booking } from "../../models/booking.model"
import { ServiceModel } from "../../models/service.model"
import { AvailabilityScheduleModel } from "../../models/availability-schedule.model"
import { AvailabilityOverrideModel } from "../../models/availability-override.model"
import { CreateBookingDto, AddPaymentDto } from "./bookings.validation"
import { HttpError } from "../../common/errors/http-error"
import {
  sendBookingPendingEmail,
  sendBookingConfirmedEmail,
  sendBookingCancelledEmail,
} from "../../common/utils/email-utils"

const DAYS_MAP = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

const getLocalDateString = (offsetDays = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export class BookingsService {
  async findAll(
    serviceId: string,
    filters: { status?: string; date?: string; search?: string },
  ) {
    const query: any = { service_id: new Types.ObjectId(serviceId) }

    // Status Filter
    if (filters.status && filters.status !== "All Statuses") {
      query.status = filters.status
    }

    // Date Filter
    if (filters.date && filters.date !== "All Dates") {
      if (filters.date === "Today") {
        query.date = getLocalDateString(0)
      } else if (filters.date === "Tomorrow") {
        query.date = getLocalDateString(1)
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
        query.date = filters.date
      }
    }

    // Search Filter
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i")
      query.$or = [
        { "customer.name": searchRegex },
        { "customer.email": searchRegex },
        { "slot.label": searchRegex },
      ]
    }

    return BookingModel.find(query).sort({ created_at: -1 })
  }

  async create(dto: CreateBookingDto, isAdmin = false) {
    const serviceId = new Types.ObjectId(dto.service_id)

    // 1. Fetch and validate service
    const service = await ServiceModel.findById(serviceId)
    if (!service || !service.is_active) {
      throw new HttpError(404, "Service not found or is inactive")
    }

    // 2. Validate availability and fetch price
    let matchedSlot: { price: number } | null = null
    const dateObj = new Date(dto.date)
    if (isNaN(dateObj.getTime())) {
      throw new HttpError(400, "Invalid date format")
    }

    // Check overrides first
    const override = await AvailabilityOverrideModel.findOne({
      service_id: serviceId,
      date: dto.date,
    })

    if (override) {
      if (override.entire_day_off) {
        throw new HttpError(400, "Service is unavailable on this date")
      }
      matchedSlot = override.custom_slots.find((s) => {
        return s.start === dto.slot.start && s.end === dto.slot.end
      }) || null
    } else {
      // Check weekly schedule
      const scheduleDoc = await AvailabilityScheduleModel.findOne({ service_id: serviceId })
      if (!scheduleDoc) {
        throw new HttpError(400, "No availability configured for this service")
      }

      const dayOfWeekIndex = dateObj.getDay()
      const dayKey = DAYS_MAP[dayOfWeekIndex] as keyof typeof scheduleDoc.schedule
      const daySchedule = scheduleDoc.schedule[dayKey]

      if (!daySchedule || !daySchedule.enabled) {
        throw new HttpError(400, "Service is unavailable on this day of the week")
      }

      matchedSlot = daySchedule.slots.find((s) => {
        return s.start === dto.slot.start && s.end === dto.slot.end
      }) || null
    }

    if (!matchedSlot) {
      throw new HttpError(400, "The requested time slot is not available")
    }

    // 3. Check for booking collisions
    const activeBooking = await BookingModel.findOne({
      service_id: serviceId,
      date: dto.date,
      "slot.start": dto.slot.start,
      status: { $in: ["pending", "confirmed"] },
    })

    if (activeBooking) {
      throw new HttpError(400, "This slot is already booked")
    }

    // 4. Create and save the booking
    const booking = new BookingModel({
      ...dto,
      service_id: serviceId,
      price_charged: matchedSlot.price,
      currency: service.currency,
      status: isAdmin ? "confirmed" : "pending",
    })
    booking.slot.label = service.name

    const savedBooking = await booking.save()

    // Send email notifications asynchronously (fire-and-forget)
    if (isAdmin) {
      sendBookingConfirmedEmail(savedBooking, service.name).catch((err) =>
        console.error("Error sending admin confirmed email:", err)
      )
    } else {
      sendBookingPendingEmail(savedBooking, service.name).catch((err) =>
        console.error("Error sending client pending email:", err)
      )
    }

    return savedBooking
  }

  async findById(serviceId: string, bookingId: string) {
    const booking = await BookingModel.findOne({
      _id: bookingId,
      service_id: new Types.ObjectId(serviceId),
    })

    if (!booking) {
      throw new HttpError(404, "Booking not found for this service")
    }

    return booking
  }

  async addPayment(serviceId: string, bookingId: string, dto: AddPaymentDto) {
    const booking = await BookingModel.findOne({
      _id: bookingId,
      service_id: new Types.ObjectId(serviceId),
    })

    if (!booking) {
      throw new HttpError(404, "Booking not found for this service")
    }

    if (!booking.payments) {
      booking.payments = []
    }

    booking.payments.push({
      amount: dto.amount,
      payment_number: dto.payment_number,
      type: dto.type,
      method: dto.method,
      notes: dto.notes,
      created_at: new Date(),
    })

    return booking.save()
  }

  async updateStatus(
    serviceId: string,
    bookingId: string,
    status: "pending" | "confirmed" | "cancelled",
    reason?: string,
  ) {
    // Verify booking belongs to the specified service
    const booking = await BookingModel.findOne({
      _id: bookingId,
      service_id: new Types.ObjectId(serviceId),
    })

    if (!booking) {
      throw new HttpError(404, "Booking not found for this service")
    }

    const service = await ServiceModel.findById(booking.service_id)
    const serviceName = service ? service.name : "Appointment"

    const previousStatus = booking.status
    booking.status = status
    const savedBooking = await booking.save()

    // Trigger emails based on new status
    if (status !== previousStatus) {
      if (status === "confirmed") {
        sendBookingConfirmedEmail(savedBooking, serviceName).catch((err) =>
          console.error("Error sending confirmed email:", err)
        )
      } else if (status === "cancelled") {
        sendBookingCancelledEmail(savedBooking, serviceName, reason).catch((err) =>
          console.error("Error sending cancelled email:", err)
        )
      }
    }

    return savedBooking
  }

  async remove(serviceId: string, bookingId: string) {
    const result = await BookingModel.findOneAndDelete({
      _id: bookingId,
      service_id: new Types.ObjectId(serviceId),
    })
    if (!result) {
      throw new HttpError(404, "Booking not found")
    }
    return result
  }
}
