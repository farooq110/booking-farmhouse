import dotenv from "dotenv"
import mongoose from "mongoose"
import { UserModel } from "./models/user.model"
import { ServiceModel } from "./models/service.model"
import { AvailabilityScheduleModel } from "./models/availability-schedule.model"
import { AvailabilityOverrideModel } from "./models/availability-override.model"
import { BookingModel } from "./models/booking.model"
import { hashPassword } from "./common/utils/hash-utils"

dotenv.config()

const getNextDayOfWeek = (dayOfWeek: number) => {
  const d = new Date()
  const resultDate = new Date(d.getTime())
  resultDate.setDate(d.getDate() + ((7 + dayOfWeek - d.getDay()) % 7))
  if (resultDate.getTime() <= d.getTime()) {
    resultDate.setDate(resultDate.getDate() + 7)
  }
  return resultDate.toISOString().split("T")[0]
}

const seed = async () => {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error("MONGO_URI environment variable is missing")
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri)
    console.log("Connected to MongoDB for seeding.")

    const dummyEmail = "admin@example.com"

    // 1. Surgical cleanup of existing dummy administrator data
    const existingUser = await UserModel.findOne({ email: dummyEmail })
    if (existingUser) {
      console.log(`Found existing user ${dummyEmail}. Cleaning up related data...`)
      const services = await ServiceModel.find({ owner_id: existingUser._id })
      const serviceIds = services.map((s) => (
        s._id
      ))

      await Promise.all([
        BookingModel.deleteMany({ service_id: { $in: serviceIds } }),
        AvailabilityScheduleModel.deleteMany({ service_id: { $in: serviceIds } }),
        AvailabilityOverrideModel.deleteMany({ service_id: { $in: serviceIds } }),
        ServiceModel.deleteMany({ owner_id: existingUser._id }),
        UserModel.deleteOne({ _id: existingUser._id }),
      ])
      console.log("Cleanup completed.")
    }

    // 2. Create the dummy administrator account
    const passwordHash = await hashPassword("admin123")
    const user = new UserModel({
      name: "Administrator",
      email: dummyEmail,
      password_hash: passwordHash,
      role: "admin",
    })
    await user.save()
    console.log("Admin account created (admin@example.com / admin123).")

    // 3. Create services
    const initialConsult = new ServiceModel({
      owner_id: user._id,
      name: "Initial Consult",
      description: "Comprehensive overview and personal scheduling strategy session.",
      location: "Room 402 / Zoom",
      currency: "USD",
      is_active: true,
    })

    const followUpConsult = new ServiceModel({
      owner_id: user._id,
      name: "Follow-up Consult",
      description: "Quick check-in and review of active tasks.",
      location: "Zoom Call",
      currency: "USD",
      is_active: true,
    })

    await Promise.all([initialConsult.save(), followUpConsult.save()])
    console.log("Services created.")

    // 4. Create availability schedules
    const initialSchedule = new AvailabilityScheduleModel({
      service_id: initialConsult._id,
      schedule: {
        mon: {
          enabled: true,
          slots: [
            { start: "09:00", end: "12:00", price: 150 },
            { start: "13:00", end: "17:00", price: 150 },
          ],
        },
        tue: { enabled: false, slots: [] },
        wed: {
          enabled: true,
          slots: [
            { start: "09:00", end: "12:00", price: 150 },
            { start: "13:00", end: "17:00", price: 150 },
          ],
        },
        thu: { enabled: false, slots: [] },
        fri: {
          enabled: true,
          slots: [
            { start: "09:00", end: "12:00", price: 150 },
            { start: "13:00", end: "17:00", price: 150 },
          ],
        },
        sat: { enabled: false, slots: [] },
        sun: { enabled: false, slots: [] },
      },
    })

    const followUpSchedule = new AvailabilityScheduleModel({
      service_id: followUpConsult._id,
      schedule: {
        mon: { enabled: false, slots: [] },
        tue: {
          enabled: true,
          slots: [
            { start: "10:00", end: "12:00", price: 80 },
            { start: "14:00", end: "16:00", price: 80 },
          ],
        },
        wed: { enabled: false, slots: [] },
        thu: {
          enabled: true,
          slots: [
            { start: "10:00", end: "12:00", price: 80 },
            { start: "14:00", end: "16:00", price: 80 },
          ],
        },
        fri: { enabled: false, slots: [] },
        sat: { enabled: false, slots: [] },
        sun: { enabled: false, slots: [] },
      },
    })

    await Promise.all([initialSchedule.save(), followUpSchedule.save()])
    console.log("Availability schedules configured.")

    // 5. Create availability overrides
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0]
    const override = new AvailabilityOverrideModel({
      service_id: initialConsult._id,
      date: tomorrowStr,
      entire_day_off: true,
      label: "System Training Day",
      custom_slots: [],
    })
    await override.save()
    console.log(`Availability override created for tomorrow (${tomorrowStr}).`)

    // 6. Create bookings
    const nextMondayStr = getNextDayOfWeek(1)
    const nextWednesdayStr = getNextDayOfWeek(3)

    const booking1 = new BookingModel({
      service_id: initialConsult._id,
      customer: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+15551234567",
      },
      date: nextMondayStr,
      slot: {
        label: "Morning Session",
        start: "09:00",
        end: "12:00",
      },
      price_charged: 150,
      currency: "USD",
      status: "confirmed",
      notes: "Wants to discuss project architecture and setup.",
    })

    const booking2 = new BookingModel({
      service_id: initialConsult._id,
      customer: {
        name: "Sarah Connor",
        email: "sarah.c@terminator.com",
        phone: "+15559876543",
      },
      date: nextWednesdayStr,
      slot: {
        label: "Afternoon Session",
        start: "13:00",
        end: "17:00",
      },
      price_charged: 150,
      currency: "USD",
      status: "pending",
      notes: "Urgent check-in requested regarding system models.",
    })

    await Promise.all([booking1.save(), booking2.save()])
    console.log("Bookings populated.")

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Seeding failed:", error)
  } finally {
    await mongoose.disconnect()
  }
}

seed().catch((err) => (
  console.error("Seeder execution error:", err)
))
