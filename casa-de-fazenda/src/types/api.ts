/**
 * TypeScript interfaces for the Availability & Bookings API.
 *
 * These are framework-agnostic types that describe the exact shape of the
 * API request and response payloads. The API client (lib/api/*) and the
 * form consume these types.
 *
 * Base URL: configurable via API_CONFIG.baseUrl in src/data/media.ts
 * Default: http://localhost:5000/api
 */

// ─── Availability API ───────────────────────────────────────

/** A single time slot within a day's availability. */
export interface AvailabilitySlot {
  start: string; // "09:00" (24h, HH:mm)
  end: string; // "10:00"
  price: number; // price in the service's currency
}

/** Availability for a single date. */
export interface DayAvailability {
  is_available: boolean;
  slots: AvailabilitySlot[];
}

/** Calendar response — keyed by date string (YYYY-MM-DD). */
export interface CalendarResponse {
  success: boolean;
  data: Record<string, DayAvailability>;
}

/** A slot within a weekly schedule entry. */
export interface ScheduleSlot {
  start: string;
  end: string;
  price: number;
}

/** A single day's schedule in the weekly configuration. */
export interface DaySchedule {
  enabled: boolean;
  slots: ScheduleSlot[];
}

/** Weekly schedule response (protected — requires JWT). */
export interface WeeklyScheduleResponse {
  success: boolean;
  data: {
    _id: string;
    service_id: string;
    schedule: {
      mon: DaySchedule;
      tue: DaySchedule;
      wed: DaySchedule;
      thu: DaySchedule;
      fri: DaySchedule;
      sat: DaySchedule;
      sun: DaySchedule;
    };
    created_at: string;
    updated_at: string;
  };
}

/** An availability override (holiday, alternate hours, etc.). */
export interface AvailabilityOverride {
  _id: string;
  service_id: string;
  date: string; // YYYY-MM-DD
  entire_day_off: boolean;
  custom_slots: ScheduleSlot[];
  label: string;
  created_at: string;
  updated_at: string;
}

/** Overrides list response (protected — requires JWT). */
export interface OverridesResponse {
  success: boolean;
  data: AvailabilityOverride[];
}

// ─── Bookings API ───────────────────────────────────────────

/** Customer info embedded in a booking request. */
export interface BookingCustomer {
  name: string;
  email: string;
  phone: string;
}

/** The slot the customer is booking. */
export interface BookingSlot {
  start: string; // "09:00"
  end: string; // "10:00"
}

/**
 * Create Booking request payload.
 *
 * This is the shape the POST /bookings endpoint expects. The form maps its
 * UI fields into this structure before sending.
 */
export interface CreateBookingRequest {
  service_id: string;
  customer: BookingCustomer;
  date: string; // YYYY-MM-DD
  slot: BookingSlot;
  notes?: string;
}

/** The slot as returned in the booking response (includes a label). */
export interface BookingResponseSlot extends BookingSlot {
  label?: string;
}

/** A booking as returned by the API after creation. */
export interface Booking {
  _id: string;
  service_id: string;
  customer: BookingCustomer;
  date: string;
  slot: BookingResponseSlot;
  price_charged: number;
  currency: string;
  status: "confirmed" | "pending" | "cancelled" | string;
  notes?: string;
  payments: unknown[];
  created_at: string;
  updated_at: string;
}

/** Create Booking response (201 Created). */
export interface CreateBookingResponse {
  success: boolean;
  data: Booking;
}

// ─── Service catalogue (UI-facing) ──────────────────────────

/**
 * A bookable service at Casa De Fazenda.
 *
 * The serviceId must match the _id configured in the backend. The label
 * is what the guest sees in the form's service selector.
 */
export interface BookableService {
  id: string;
  label: string;
  description: string;
}
