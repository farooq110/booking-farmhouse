"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BookingDatePicker } from "@/components/ui/booking-date-picker";
import { CTAButton, Icon } from "@/components/ui/luxury-primitives";
import {
  guestEnquirySchema,
  type GuestEnquiryValues,
  OCCASION_LABELS,
  TIME_SLOT_LABELS,
  SERVICE_OPTIONS,
  ADDON_OPTIONS,
  HOUSE_RULES,
} from "@/lib/validation/schemas";
import { getCalendar, createBooking } from "@/lib/api/client";
import { API_CONFIG } from "@/data/media";
import type { AvailabilitySlot } from "@/types/api";

/**
 * Today's date in YYYY-MM-DD (the format the date picker expects).
 * Used to disable past dates in the booking date field.
 */
function getTodayISO(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
const todayISO = getTodayISO();

/**
 * GuestEnquiryForm — inline form (NOT a modal) for guests to book a stay.
 *
 * API integration:
 *  - serviceId is set from environment variable (NEXT_PUBLIC_DEFAULT_SERVICE_ID)
 *  - When the user picks a date, fetches GET /availability/:serviceId/calendar
 *  - Shows available slots from the API as a select dropdown
 *  - On submit, POSTs to /bookings with the mapped fields
 *
 * Field mapping (UI → API):
 *  - serviceId          → service_id (from environment, not form)
 *  - guestName          → customer.name
 *  - email              → customer.email
 *  - phone              → customer.phone
 *  - bookingDate        → date
 *  - slot ("HH:mm-HH:mm") → slot { start, end }
 *  - notes              → notes
 *
 * UI-only fields (NOT sent to API, kept for owner reference):
 *  - checkIn, checkOut, guests, timeSlot, occasion, addons, agreeToHouseRules
 */
export function GuestEnquiryForm() {
  // serviceId is applied from environment variable — single time, not changeable in form
  const serviceId = process.env.NEXT_PUBLIC_DEFAULT_SERVICE_ID || API_CONFIG.defaultServiceId;

  const [submitted, setSubmitted] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<GuestEnquiryValues>({
    resolver: zodResolver(guestEnquirySchema),
    // Validate on every change so `isValid` updates live — drives the
    // disabled state of the submit button until all required fields are
    // filled AND the house rules checkbox is checked.
    mode: "onChange",
    defaultValues: {
      bookingDate: "",
      slot: "",
      guestName: "",
      email: "",
      phone: "",
      notes: "",
      checkIn: "",
      checkOut: "",
      guests: 2,
      timeSlot: "full-day",
      occasion: "holiday",
      addons: [],
      agreeToHouseRules: false,
    },
  });

  const addons = useWatch({ control, name: "addons" }) ?? [];
  const agreeToHouseRules = useWatch({ control, name: "agreeToHouseRules" }) ?? false;
  const bookingDate = useWatch({ control, name: "bookingDate" });
  const slot = useWatch({ control, name: "slot" }) ?? "";
  const guestName = useWatch({ control, name: "guestName" }) ?? "";
  const email = useWatch({ control, name: "email" }) ?? "";

  // ── Submit button enable rule ──
  // Disabled until ALL of: required fields filled, house rules checked,
  // not currently submitting, not currently fetching slots.
  // `isValid` covers the Zod schema (date format + future check + email
  // format + min name length + house rules checked).
  const canSubmit =
    isValid &&
    !isSubmitting &&
    !slotsLoading;

  // ── Fetch calendar when serviceId + bookingDate change ──
  // Uses the result-based API client — never throws. Every error is
  // classified and rendered via a themed toast. No UI breaks.
  useEffect(() => {
    if (!serviceId || !bookingDate) {
      return;
    }

    let cancelled = false;
    let frame = requestAnimationFrame(() => {
      frame = 0;
      setSlotsLoading(true);
      setSlotsError(null);
      setAvailableSlots([]);
      setValue("slot", "");

      getCalendar(serviceId, bookingDate, bookingDate).then((result) => {
        if (cancelled) return;

        if (result.ok) {
          const dayData = result.data.data?.[bookingDate];
          if (dayData?.is_available && dayData.slots?.length) {
            setAvailableSlots(dayData.slots);
          } else {
            setAvailableSlots([]);
            setSlotsError("No slots available on this date. Try another date.");
          }
          setSlotsLoading(false);
          return;
        }

        // ── Error path ── never throws, never breaks the tree ──
        const err = result.error;
        setSlotsLoading(false);
        setAvailableSlots([]);

        if (err.kind === "no-network" || err.kind === "timeout" || err.kind === "server") {
          setSlotsError(err.message);
          toast.error("Couldn't check availability", {
            description:
              err.kind === "no-network"
                ? "The booking server can't be reached. Please check your connection."
                : err.kind === "timeout"
                  ? "The server took too long to respond. Please try again."
                  : "The booking server is having issues right now. Please try again shortly.",
            duration: 6000,
          });
        } else if (err.kind === "no-config" || err.kind === "no-service-id") {
          setSlotsError(err.message);
          toast.warning("Booking service not configured", {
            description: "Please contact the owner directly by phone or email to book.",
            duration: 8000,
          });
        } else {
          setSlotsError(err.message);
          toast.error("Couldn't check availability", {
            description: err.message,
            duration: 5000,
          });
        }
      });
    });

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
    };
  }, [serviceId, bookingDate, setValue]);

  // ── Submit ──
  // Uses the result-based API client — never throws. Every error is
  // classified and rendered via a themed toast with a retry / call-owner CTA.
  const onSubmit = async (data: GuestEnquiryValues) => {
    setBookingError(null);

    // Parse slot "HH:mm-HH:mm" → { start, end }
    const [slotStart, slotEnd] = data.slot.split("-");

    const result = await createBooking({
      service_id: serviceId,
      customer: {
        name: data.guestName,
        email: data.email,
        phone: data.phone || "",
      },
      date: data.bookingDate,
      slot: { start: slotStart, end: slotEnd },
      notes: data.notes,
    });

    if (result.ok) {
      const bookingId = result.data.data?._id ?? "pending";
      console.info("[The Green Valley] Booking confirmed:", bookingId);

      toast.success("Booking confirmed!", {
        description: `Reference: ${bookingId}. The owner will be in touch within 24 hours.`,
        duration: 6000,
      });

      // ── Full reset: form values, errors, validation state, AND all
      // related component state (slots, errors, loading flags). ──
      reset({
        bookingDate: "",
        slot: "",
        guestName: "",
        email: "",
        phone: "",
        notes: "",
        checkIn: "",
        checkOut: "",
        guests: 2,
        timeSlot: "full-day",
        occasion: "holiday",
        addons: [],
        agreeToHouseRules: false,
      });
      setAvailableSlots([]);
      setSlotsError(null);
      setSlotsLoading(false);
      setBookingError(null);
      setSubmitted(true);
      return;
    }

    // ── Error path ── render a themed toast with the appropriate action ──
    const err = result.error;
    console.error("[The Green Valley] Booking failed:", err.kind, err.technical);

    // Inline error under the submit button (always shown, regardless of kind)
    setBookingError(err.message);

    // Per-kind toast with helpful actions
    if (err.kind === "no-network" || err.kind === "timeout" || err.kind === "server") {
      toast.error("Couldn't submit your booking", {
        description:
          err.kind === "no-network"
            ? "The booking server can't be reached. It may be down or you may be offline."
            : err.kind === "timeout"
              ? "The server took too long to respond. Please try again."
              : "The booking server is having issues right now. Please try again in a moment.",
        duration: 8000,
        action: {
          label: "Try again",
          onClick: () => handleSubmit(onSubmit)(),
        },
      });
    } else if (err.kind === "client" && err.status === 409) {
      toast.warning("This slot is already booked", {
        description: "Please pick another time slot or a different date.",
        duration: 7000,
      });
    } else if (err.kind === "no-config" || err.kind === "no-service-id") {
      toast.warning("Booking service not configured", {
        description: "Please contact the owner directly by phone or email to book.",
        duration: 8000,
      });
    } else {
      toast.error("Couldn't submit your booking", {
        description: err.message,
        duration: 6000,
        action: {
          label: "Try again",
          onClick: () => handleSubmit(onSubmit)(),
        },
      });
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-10 text-center elevation-2">
        <span className="material-symbols-outlined text-6xl text-tertiary">mark_email_read</span>
        <h3 className="mt-4 font-display text-3xl text-on-surface">
          Your booking is on its way.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-on-surface-variant leading-relaxed">
          Thank you for choosing The Green Valley. The owner reads every enquiry
          personally and will reply within 24 hours — usually much sooner.
        </p>
        <CTAButton
          variant="outline"
          size="md"
          className="mt-6"
          onClick={() => {
            // Form + all related state was already cleared on submit.
            // Just hide the confirmation screen to reveal the empty form.
            setSubmitted(false);
          }}
        >
          <Icon name="refresh" className="text-base" />
          Make another booking
        </CTAButton>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 overflow-hidden rounded-2xl sm:rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 sm:p-8 elevation-2"
      noValidate
    >
      {/* ── Section: Date + Slot (API-driven) ── */}
      {/* Note: serviceId is applied from env variable (NEXT_PUBLIC_DEFAULT_SERVICE_ID) */}
      <fieldset className="space-y-5 min-w-0">
        <legend className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-primary">
          <span className="material-symbols-outlined text-base">event_available</span>
          Booking details
        </legend>

        {/* Service field commented out — serviceId is set from environment variable */}
        {/* <Field label="Service" error={errors.serviceId?.message}>
          <Select
            defaultValue={API_CONFIG.defaultServiceId}
            onValueChange={(v) =>
              setValue("serviceId", v, { shouldValidate: true })
            }
          >
            <SelectTrigger className="border-outline-variant bg-surface-container-low text-on-surface">
              <SelectValue placeholder="Choose a service" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_OPTIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field> */}

        <Field label="Booking date" error={errors.bookingDate?.message}>
          <BookingDatePicker
            value={bookingDate}
            onChange={(val) => setValue("bookingDate", val, { shouldValidate: true })}
            min={todayISO}
            error={errors.bookingDate?.message}
          />
        </Field>

        <Field
          label="Available time slot"
          error={errors.slot?.message || slotsError || undefined}
          hint={
            slotsLoading
              ? "Checking availability…"
              : availableSlots.length > 0
                ? `${availableSlots.length} slot${availableSlots.length === 1 ? "" : "s"} available${
                    availableSlots[0]?.price ? ` · from $${availableSlots[0].price}` : ""
                  }`
                : "Pick a date to see available slots."
          }
        >
          {slotsLoading ? (
            <div className="flex items-center gap-3 rounded-md border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant animate-pulse">
              <span className="material-symbols-outlined text-base text-outline animate-spin">
                hourglass_top
              </span>
              <span>Fetching available time slots…</span>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-low px-3 py-2.5 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-base text-outline">
                schedule
              </span>
              {slotsError ? "No slots available" : "No slots loaded yet"}
            </div>
          ) : (
            <Select
              onValueChange={(v) => setValue("slot", v, { shouldValidate: true })}
            >
              <SelectTrigger className="border-outline-variant bg-surface-container-low text-on-surface">
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot) => (
                  <SelectItem key={`${slot.start}-${slot.end}`} value={`${slot.start}-${slot.end}`}>
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {slot.start} – {slot.end}
                      {slot.price ? ` · $${slot.price}` : ""}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
      </fieldset>

      <div className="h-px bg-outline-variant/60" />

      {/* ── Section: Your contact ── */}
      <fieldset className="space-y-5 min-w-0">
        <legend className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-primary">
          <span className="material-symbols-outlined text-base">person</span>
          Your contact
        </legend>

        <Field label="Your name" error={errors.guestName?.message}>
          <Input
            {...register("guestName")}
            autoComplete="name"
            className="border-outline-variant bg-surface-container-low text-on-surface"
            aria-invalid={!!errors.guestName}
          />
        </Field>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              {...register("email")}
              autoComplete="email"
              className="border-outline-variant bg-surface-container-low text-on-surface"
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field label="Phone (optional)" error={errors.phone?.message}>
            <Input
              type="tel"
              {...register("phone")}
              autoComplete="tel"
              className="border-outline-variant bg-surface-container-low text-on-surface"
              aria-invalid={!!errors.phone}
            />
          </Field>
        </div>
      </fieldset>

      <div className="h-px bg-outline-variant/60" />

      {/* ── Section: Additional preferences (UI-only, not sent to API) ── */}
      {/* <fieldset className="space-y-5 min-w-0">
        <legend className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-primary">
          <span className="material-symbols-outlined text-base">tune</span>
          Additional preferences
          <span className="ml-1 rounded-full bg-secondary-container px-2 py-0.5 text-[9px] text-on-secondary-container normal-case tracking-normal">
            for the owner
          </span>
        </legend>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <Field label="Preferred arrival (optional)" error={errors.checkIn?.message}>
            <Input
              type="date"
              {...register("checkIn")}
              className="border-outline-variant bg-surface-container-low text-on-surface"
            />
          </Field>
          <Field label="Preferred departure (optional)" error={errors.checkOut?.message}>
            <Input
              type="date"
              {...register("checkOut")}
              className="border-outline-variant bg-surface-container-low text-on-surface"
            />
          </Field>
        </div>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <Field label="Number of guests" error={errors.guests?.message}>
            <Input
              type="number"
              min={1}
              max={16}
              {...register("guests", { valueAsNumber: true })}
              className="border-outline-variant bg-surface-container-low text-on-surface"
              aria-invalid={!!errors.guests}
            />
          </Field>
          <Field label="Preferred time of day" error={errors.timeSlot?.message}>
            <Select
              defaultValue="full-day"
              onValueChange={(v) =>
                setValue("timeSlot", v as GuestEnquiryValues["timeSlot"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="border-outline-variant bg-surface-container-low text-on-surface">
                <SelectValue placeholder="Choose a slot" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TIME_SLOT_LABELS) as Array<keyof typeof TIME_SLOT_LABELS>).map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {TIME_SLOT_LABELS[slot]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </fieldset>

      <div className="h-px bg-outline-variant/60" /> */}

      {/* ── Section: Occasion ── */}
      {/* <fieldset className="space-y-3 min-w-0">
        <legend className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-primary">
          <span className="material-symbols-outlined text-base">celebration</span>
          What brings you to The Green Valley?
        </legend>

        <RadioGroup
          defaultValue="holiday"
          onValueChange={(v) =>
            setValue("occasion", v as GuestEnquiryValues["occasion"], {
              shouldValidate: true,
            })
          }
          className="grid gap-2"
        >
          {(Object.keys(OCCASION_LABELS) as Array<keyof typeof OCCASION_LABELS>).map((occ) => (
            <label
              key={occ}
              htmlFor={`occ-${occ}`}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2.5 transition hover:border-primary"
            >
              <RadioGroupItem value={occ} id={`occ-${occ}`} />
              <span className="text-sm text-on-surface">{OCCASION_LABELS[occ]}</span>
            </label>
          ))}
        </RadioGroup>
        {errors.occasion?.message && (
          <p role="alert" className="text-xs text-error">
            {errors.occasion.message}
          </p>
        )}
      </fieldset>

      <div className="h-px bg-outline-variant/60" /> */}

      {/* ── Section: Add-ons ── */}
      {/* <fieldset className="space-y-3 min-w-0">
        <legend className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-primary">
          <span className="material-symbols-outlined text-base">room_service</span>
          Add-ons the owner can arrange (optional)
        </legend>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {ADDON_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 transition hover:border-primary"
            >
              <Checkbox
                checked={addons.includes(opt.id)}
                onCheckedChange={() => {
                  const next = addons.includes(opt.id)
                    ? addons.filter((x) => x !== opt.id)
                    : [...addons, opt.id];
                  setValue("addons", next, { shouldValidate: false });
                }}
                className="border-outline data-[state=checked]:bg-primary data-[state=checked]:text-on-primary"
              />
              <span className="text-sm text-on-surface">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="h-px bg-outline-variant/60" /> */}

      {/* ── Section: Notes ── */}
      {/* <Field
        label="Anything you'd like the owner to know? (optional)"
        error={errors.notes?.message}
        hint="Allergies, dietary needs, celebration details, accessibility, arrival logistics…"
      >
        <Textarea
          {...register("notes")}
          rows={4}
          className="border-outline-variant bg-surface-container-low text-on-surface"
          placeholder="We're celebrating my mother's 70th birthday — she loves orchids and jazz…"
        />
      </Field> */}

      {/* ── House rules ── */}
      <div className="rounded-2xl bg-secondary-container/30 p-5">
        <p className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-on-secondary-container">
          <span className="material-symbols-outlined text-base">gavel</span>
          House rules
        </p>
        <ul className="mt-3 grid gap-1.5 text-xs text-on-surface-variant sm:grid-cols-2">
          {HOUSE_RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-1.5">
              <span className="material-symbols-outlined text-sm text-tertiary">check</span>
              {rule}
            </li>
          ))}
        </ul>

        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={agreeToHouseRules}
            onCheckedChange={(v) => setValue("agreeToHouseRules", v === true, { shouldValidate: true })}
            className="mt-0.5 border-outline data-[state=checked]:bg-primary data-[state=checked]:text-on-primary"
          />
          <span className="text-sm text-on-surface-variant leading-relaxed">
            I have read and agree to the house rules above.
          </span>
        </label>
        {errors.agreeToHouseRules?.message && (
          <p role="alert" className="mt-2 flex items-center gap-1 text-xs text-error">
            <span className="material-symbols-outlined text-sm">error</span>
            {errors.agreeToHouseRules.message}
          </p>
        )}
      </div>

      {/* ── Booking error ── */}
      {bookingError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl bg-error/10 p-4 text-sm text-error"
        >
          <span className="material-symbols-outlined text-base mt-0.5">error</span>
          <span>{bookingError}</span>
        </div>
      )}

      {/* ── Submit ── */}
      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-on-surface-variant">
          <span className="material-symbols-outlined inline text-sm align-middle text-tertiary">
            bolt
          </span>{" "}
          Your booking goes <strong className="text-on-surface">directly to the owner</strong> — no middleman, no booking fee.
        </p>
        <CTAButton
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className={!canSubmit ? "opacity-60 cursor-not-allowed" : ""}
          title={
            !isValid
              ? "Fill in all required fields and agree to the house rules to enable submit"
              : isSubmitting
                ? "Sending your booking…"
                : "Send your booking to the owner"
          }
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              Sending…
            </>
          ) : (
            <>
              <Icon name="send" className="text-base" />
              Send my booking
            </>
          )}
        </CTAButton>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide-luxe text-on-surface-variant">
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-on-surface-variant/80">{hint}</p>
      )}
      {error && (
        <p role="alert" className="flex items-center gap-1 text-xs text-error">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
