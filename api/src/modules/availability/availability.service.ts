import { Types } from "mongoose"
import { AvailabilityScheduleModel, DaySchedule } from "../../models/availability-schedule.model"
import { AvailabilityOverrideModel } from "../../models/availability-override.model"
import { BookingModel } from "../../models/booking.model"
import { CreateOverrideDto, UpdateScheduleDto } from "./availability.validation"
import { HttpError } from "../../common/errors/http-error"

const DAYS_MAP = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

export class AvailabilityService {
  async getSchedule(serviceId: string) {
    const schedule = await AvailabilityScheduleModel.findOne({
      service_id: new Types.ObjectId(serviceId),
    })

    if (!schedule) {
      const defaultDay: DaySchedule = { enabled: false, slots: [] }
      return {
        service_id: serviceId,
        schedule: {
          mon: defaultDay,
          tue: defaultDay,
          wed: defaultDay,
          thu: defaultDay,
          fri: defaultDay,
          sat: defaultDay,
          sun: defaultDay,
        },
      }
    }

    return schedule
  }

  async updateSchedule(serviceId: string, dto: UpdateScheduleDto) {
    return AvailabilityScheduleModel.findOneAndUpdate(
      { service_id: new Types.ObjectId(serviceId) },
      { $set: { schedule: dto.schedule } },
      { new: true, upsert: true },
    )
  }

  async getOverrides(serviceId: string) {
    return AvailabilityOverrideModel.find({
      service_id: new Types.ObjectId(serviceId),
    }).sort({ date: 1 })
  }

  async createOverride(serviceId: string, dto: CreateOverrideDto) {
    const existing = await AvailabilityOverrideModel.findOne({
      service_id: new Types.ObjectId(serviceId),
      date: dto.date,
    })

    if (existing) {
      throw new HttpError(400, `An override already exists for date ${dto.date}`)
    }

    const override = new AvailabilityOverrideModel({
      ...dto,
      service_id: new Types.ObjectId(serviceId),
    })
    return override.save()
  }

  async deleteOverride(serviceId: string, overrideId: string) {
    const result = await AvailabilityOverrideModel.findOneAndDelete({
      _id: overrideId,
      service_id: new Types.ObjectId(serviceId),
    })
    if (!result) {
      throw new HttpError(404, "Override not found")
    }
    return result
  }

  async getCalendar(serviceId: string, startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr)
    const end = new Date(endDateStr)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new HttpError(400, "Invalid start or end date format")
    }

    if (start > end) {
      throw new HttpError(400, "Start date must be before end date")
    }

    // Reuse a single ObjectId instance for all queries
    const serviceObjectId = new Types.ObjectId(serviceId)

    // 1. Fire all 3 DB queries in parallel with .lean() for plain JS objects
    const [scheduleDoc, overrides, bookings] = await Promise.all([
      AvailabilityScheduleModel.findOne({ service_id: serviceObjectId }).lean(),
      AvailabilityOverrideModel.find({
        service_id: serviceObjectId,
        date: { $gte: startDateStr, $lte: endDateStr },
      }).lean(),
      BookingModel.find({
        service_id: serviceObjectId,
        date: { $gte: startDateStr, $lte: endDateStr },
        status: { $in: ["pending", "confirmed"] },
      })
        .select({ date: 1, "slot.start": 1, _id: 0 })
        .lean(),
    ])

    // 2. Pre-compute weekly schedule slots once per day-of-week (7 entries max)
    //    Avoids re-mapping the same slot arrays on every iteration
    type SlotEntry = { start: string; end: string; price: number }
    const weeklySlotCache: (SlotEntry[] | null)[] = new Array(7).fill(null)

    if (scheduleDoc) {
      for (let i = 0; i < 7; i++) {
        const dayKey = DAYS_MAP[i] as keyof typeof scheduleDoc.schedule
        const daySchedule = scheduleDoc.schedule[dayKey]
        if (daySchedule && daySchedule.enabled && daySchedule.slots.length > 0) {
          weeklySlotCache[i] = daySchedule.slots.map((s) => ({
            start: s.start,
            end: s.end,
            price: s.price,
          }))
        }
      }
    }

    // 3. Index overrides by date for O(1) lookups
    const overridesMap = new Map(overrides.map((o) => [o.date, o]))

    // 4. Build a single composite-key Set for all booked slots across the entire range
    //    Key format: "YYYY-MM-DD|HH:mm" — avoids creating a new Set per day
    const bookedSlotKeys = new Set(
      bookings.map((b) => `${b.date}|${b.slot.start}`),
    )

    // 5. Iterate through each date in the range
    const calendar: Record<string, { is_available: boolean; slots: SlotEntry[] }> = {}
    const current = new Date(start)

    while (current <= end) {
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, "0")
      const day = String(current.getDate()).padStart(2, "0")
      const dateStr = `${year}-${month}-${day}`

      let baseSlots: SlotEntry[] | null = null
      const override = overridesMap.get(dateStr)

      if (override) {
        // Override takes precedence — either day-off or custom slots
        if (!override.entire_day_off && override.custom_slots.length > 0) {
          baseSlots = override.custom_slots.map((s) => ({
            start: s.start,
            end: s.end,
            price: s.price,
          }))
        }
      } else {
        // Use pre-computed weekly cache — zero allocation, just a reference
        baseSlots = weeklySlotCache[current.getDay()]
      }

      if (!baseSlots || baseSlots.length === 0) {
        // No slots at all — unavailable day
        calendar[dateStr] = { is_available: false, slots: [] }
      } else {
        // Filter out booked slots using the composite-key Set (O(1) per slot)
        const availableSlots = baseSlots.filter(
          (slot) => !bookedSlotKeys.has(`${dateStr}|${slot.start}`),
        )
        calendar[dateStr] = {
          is_available: availableSlots.length > 0,
          slots: availableSlots,
        }
      }

      current.setDate(current.getDate() + 1)
    }

    return calendar
  }
}
