/**
 * Zod schemas — the ONLY file that imports zod directly.
 * Components import { guestEnquirySchema } from this module.
 * Swapping zod → valibot / yup means editing only this file.
 *
 * Note: this form is for GUESTS who want to enquire about staying at
 * Summer Land Farm House. The enquiry goes DIRECTLY to the Summer Land Farm House owner —
 * no middleman, no platform fee, no commission. The owner manages
 * their own property and replies to guests personally.
 */
import { z } from "zod";

export const guestEnquirySchema = z.object({
  // ── API-mapped fields ──
  // These fields are sent to the POST /bookings endpoint.
  // Note: serviceId is now applied from environment variable (NEXT_PUBLIC_DEFAULT_SERVICE_ID)

  // Single date the guest wants to book (maps to API `date` field).
  // Schema-level guard: reject past dates so the form is safe even if
  // someone removes the `min` attribute from the input.
  bookingDate: z
    .string()
    .min(1, "Please pick a date to see available slots.")
    .refine(
      (val) => {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
        if (!m) return false;
        const [, y, mo, d] = m;
        const picked = new Date(Number(y), Number(mo) - 1, Number(d));
        if (Number.isNaN(picked.getTime())) return false;
        const today = new Date();
        const todayMidnight = new Date(
          today.getFullYear(), today.getMonth(), today.getDate()
        );
        return picked.getTime() >= todayMidnight.getTime();
      },
      "Please pick today or a future date — past dates cannot be booked."
    ),

  // Specific slot from the calendar API (maps to API `slot.start` + `slot.end`)
  // Stored as "start-end" string, e.g. "09:00-10:00"
  slot: z
    .string()
    .min(1, "Please choose an available time slot."),

  // ── Guest contact (maps to API `customer` object) ──
  guestName: z
    .string()
    .min(2, "Please share your name so we can address you personally.")
    .max(80, "That name is a touch too long — please shorten it."),

  email: z
    .string()
    .min(1, "An email is required so we can reply to you.")
    .email("Please enter a valid email address."),

  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[+\d][\d\s()-]{6,20}$/.test(v),
      "Please enter a valid phone number, including country code."
    ),

  notes: z
    .string()
    .max(800, "Please keep your notes under 800 characters.")
    .optional(),

  // ── UI-only fields (NOT sent to the API) ──
  // These stay in the form for the owner's reference but are not part of the
  // booking payload. They are validated but excluded from the API request.

  checkIn: z
    .string()
    .optional(),

  checkOut: z
    .string()
    .optional(),

  guests: z
    .number({ message: "Please tell us how many guests." })
    .int()
    .min(1, "At least one guest is required.")
    .max(16, "Summer Land Farm House accommodates up to 16 guests per stay."),

  timeSlot: z
    .enum(["morning", "afternoon", "evening", "full-day"], {
      message: "Please choose a preferred time slot.",
    }),

  occasion: z
    .enum(["holiday", "celebration", "retreat", "photography", "other"], {
      message: "Please choose the occasion for your stay.",
    }),

  addons: z
    .array(z.string())
    .optional(),

  agreeToHouseRules: z
    .boolean()
    .refine(
      (v) => v === true,
      "Please acknowledge the house rules so we can confirm your enquiry."
    ),
});

export type GuestEnquiryValues = z.infer<typeof guestEnquirySchema>;

export const OCCASION_LABELS = {
  holiday: "Family or friends holiday",
  celebration: "Birthday, anniversary, or milestone",
  retreat: "Wellness, writing, or creative retreat",
  photography: "Photography or film shoot",
  other: "Something else — I'll explain in the notes",
} as const;

export const TIME_SLOT_LABELS = {
  "morning": "Morning · 6 AM – 12 PM",
  "afternoon": "Afternoon · 12 PM – 5 PM",
  "evening": "Evening · 5 PM – 10 PM",
  "full-day": "Full day · 6 AM – 10 PM",
} as const;

/**
 * Bookable services at Summer Land Farm House.
 * The `id` must match the service _id in the backend.
 * Change these to match your backend's service catalogue.
 */
export const SERVICE_OPTIONS = [
  {
    id: "summer-land-farm-house-full-estate",
    label: "Full Estate Booking",
    description: "Entire Summer Land Farm House + all facilities (pool, park, gaming, sports)",
  },
  {
    id: "summer-land-farm-house-day-pass",
    label: "Day Pass",
    description: "Daytime access to pool, gardens, and sports facilities",
  },
  {
    id: "summer-land-farm-house-event",
    label: "Event / Celebration",
    description: "Private event booking with full estate access",
  },
] as const;

export const ADDON_OPTIONS = [
  { id: "chef", label: "Private chef & sommelier (in-house)" },
  { id: "breakfast", label: "Summer Land Farm House breakfast basket daily" },
  { id: "spa", label: "On-site spa therapist" },
  { id: "orchard-tour", label: "Guided orchard & garden walk" },
  { id: "horseback", label: "Sunrise horseback trail ride" },
  { id: "stargazing", label: "Stargazing dinner on the deck" },
  { id: "transfer", label: "Chauffeured airport transfer" },
] as const;

export const HOUSE_RULES = [
  "Check-in from 3 PM, check-out by 11 AM",
  "No smoking inside the pavilions",
  "Pets welcome with prior notice",
  "Quiet hours from 10 PM to 7 AM",
  "Maximum 16 guests per stay",
];
