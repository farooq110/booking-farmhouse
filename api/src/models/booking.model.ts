import { Schema, model, Types } from "mongoose"

export interface CustomerInfo {
  name: string
  email: string
  phone: string
}

export interface BookedSlot {
  label: string
  start: string
  end: string
}

export interface Payment {
  _id?: Types.ObjectId
  amount: number
  payment_number: string
  type: "advance" | "full"
  method: string
  notes?: string
  created_at: Date
}

export interface Booking {
  service_id: Types.ObjectId
  customer: CustomerInfo
  date: string // YYYY-MM-DD
  slot: BookedSlot
  price_charged: number
  currency: string
  status: "pending" | "confirmed" | "cancelled"
  notes?: string
  payments?: Payment[]
  created_at: Date
  updated_at: Date
}

const customerInfoSchema = new Schema<CustomerInfo>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
)

const bookedSlotSchema = new Schema<BookedSlot>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  { _id: false },
)

const paymentSchema = new Schema<Payment>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_number: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["advance", "full"],
      required: true,
    },
    method: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  }
)

const bookingSchema = new Schema<Booking>(
  {
    service_id: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    customer: {
      type: customerInfoSchema,
      required: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    slot: {
      type: bookedSlotSchema,
      required: true,
    },
    price_charged: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    payments: {
      type: [paymentSchema],
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

// Ensure no double-booking for the same active slot (not cancelled)
// Note: We include status in index or filter, or do a partial index.
// Let's create a unique compound index for service_id + date + slot.start
// but we want to allow re-booking if previous was cancelled.
// Mongoose partial unique index:
bookingSchema.index(
  { service_id: 1, date: 1, "slot.start": 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: "cancelled" } },
  },
)

export const BookingModel = model<Booking>("Booking", bookingSchema)
