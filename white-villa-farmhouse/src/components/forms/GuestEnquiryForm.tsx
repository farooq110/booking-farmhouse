"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BookingDatePicker } from "@/components/ui/booking-date-picker";
import { Icon } from "@/components/ui/luxury-primitives";
import {
  guestEnquirySchema,
  type GuestEnquiryValues,
  HOUSE_RULES,
} from "@/lib/validation/schemas";
import { getCalendar, createBooking } from "@/lib/api/client";
import { API_CONFIG, FARMHOUSE } from "@/data/media";
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
 * Layout v2 — Eco-Farm "step rail":
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  ┌──────────────┐  ┌──────────────────────────────────┐ │
 *   │  │ STEP RAIL    │  │ SECTION 01 — Your visit          │ │
 *   │  │ 01 Your visit│  │  · date picker                   │ │
 *   │  │ 02 Reach you │  │  · time slot select              │ │
 *   │  │ 03 Confirm   │  │ SECTION 02 — Reach you          │ │
 *   │  │              │  │  · name, email, phone            │ │
 *   │  │ SUMMARY      │  │  · notes                         │ │
 *   │  │  · date      │  │ SECTION 03 — House rules        │ │
 *   │  │  · slot      │  │  · rules + acknowledge checkbox │ │
 *   │  │  · guests    │  │                                  │ │
 *   │  └──────────────┘  └──────────────────────────────────┘ │
 *   │  ┌──────────────────────────────────────────────────┐  │
 *   │  │ STICKY ACTION BAR · reassurance + submit button  │  │
 *   │  └──────────────────────────────────────────────────┘  │
 *   └─────────────────────────────────────────────────────────┘
 *
 * Distinct from the previous single-column form:
 *   - A left "step rail" with numbered sage badges + a live summary
 *     of what the guest has entered so far.
 *   - Form sections renumbered (01/02/03) with sage section headers
 *     and a hairline divider.
 *   - A sticky bottom action bar with the submit + reassurance copy
 *     instead of an inline submit row.
 *
 * API integration is unchanged — same fields, same endpoints, same
 * error handling.
 */
export function GuestEnquiryForm() {
  const serviceId = process.env.NEXT_PUBLIC_DEFAULT_SERVICE_ID || API_CONFIG.defaultServiceId;

  const [submitted, setSubmitted] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  // ── API reachability flag ──
  // Once we detect the API is unreachable (no-network / timeout / server),
  // we stop making further calendar fetches so the user doesn't get
  // repeated ERR_CONNECTION_REFUSED errors in the console every time
  // they pick a different date. The form still works — it just shows
  // "no slots" and tells the user to contact the owner directly.
  const [apiUnreachable, setApiUnreachable] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<GuestEnquiryValues>({
    resolver: zodResolver(guestEnquirySchema),
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

  const agreeToHouseRules = useWatch({ control, name: "agreeToHouseRules" }) ?? false;
  const bookingDate = useWatch({ control, name: "bookingDate" });
  const slot = useWatch({ control, name: "slot" }) ?? "";
  const guestName = useWatch({ control, name: "guestName" }) ?? "";
  const email = useWatch({ control, name: "email" }) ?? "";
  const phone = useWatch({ control, name: "phone" }) ?? "";
  const notes = useWatch({ control, name: "notes" }) ?? "";

  const canSubmit = isValid && !isSubmitting && !slotsLoading;

  // ── Fetch calendar when serviceId + bookingDate change ──
  // Skipped if we've already detected the API is unreachable — prevents
  // repeated ERR_CONNECTION_REFUSED console errors every time the user
  // picks a new date when the backend isn't running.
  useEffect(() => {
    if (!serviceId || !bookingDate) return;
    if (apiUnreachable) {
      // Show the "contact owner" message once, then stop trying.
      setAvailableSlots([]);
      setSlotsLoading(false);
      setSlotsError("Booking service is offline. Please contact the owner directly by phone or email.");
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
        const err = result.error;
        setSlotsLoading(false);
        setAvailableSlots([]);
        // ── Mark API as unreachable so we don't retry on every date change ──
        if (err.kind === "no-network" || err.kind === "timeout" || err.kind === "server") {
          setApiUnreachable(true);
          setSlotsError("Booking service is offline. Please contact the owner directly by phone or email.");
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
  }, [serviceId, bookingDate, setValue, apiUnreachable]);

  // ── Submit ──
  const onSubmit = async (data: GuestEnquiryValues) => {
    setBookingError(null);
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
      console.info("[White Villa FarmHouse] Booking confirmed:", bookingId);
      toast.success("Booking confirmed!", {
        description: `Reference: ${bookingId}. The owner will be in touch within 24 hours.`,
        duration: 6000,
      });
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

    const err = result.error;
    console.error("[White Villa FarmHouse] Booking failed:", err.kind, err.technical);
    setBookingError(err.message);

    if (err.kind === "no-network" || err.kind === "timeout" || err.kind === "server") {
      toast.error("Couldn't submit your booking", {
        description:
          err.kind === "no-network"
            ? "The booking server can't be reached. It may be down or you may be offline."
            : err.kind === "timeout"
              ? "The server took too long to respond. Please try again."
              : "The booking server is having issues right now. Please try again in a moment.",
        duration: 8000,
        action: { label: "Try again", onClick: () => handleSubmit(onSubmit)() },
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
        action: { label: "Try again", onClick: () => handleSubmit(onSubmit)() },
      });
    }
  };

  // ── Success state — redesigned confirmation card ──
  if (submitted) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-sage/40 bg-surface-container-lowest p-8 sm:p-12 elevation-3">
        {/* Sage leaf glyph in the corner */}
        <span
          className="pointer-events-none absolute -right-10 -top-10 text-[12rem] leading-none text-sage-soft/40 select-none"
          aria-hidden="true"
        >
          <Icon name="eco" filled />
        </span>
        <div className="relative">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage elevation-1">
            <span className="material-symbols-outlined text-4xl">mark_email_read</span>
          </span>
          <h3 className="mt-5 font-display text-3xl sm:text-4xl text-on-surface">
            Your booking is on its way.
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Thank you for choosing White Villa FarmHouse. The owner reads every
            enquiry personally and will reply within 24 hours — usually much sooner.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`tel:${FARMHOUSE.phone}`}
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-5 py-2.5 font-sans text-[11px] uppercase tracking-luxe text-on-surface-variant transition hover:border-sage hover:text-primary state-layer"
            >
              <span className="material-symbols-outlined text-base">call</span>
              Call the owner
            </a>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="inline-flex items-center gap-2 rounded-full bg-sage px-5 py-2.5 font-sans text-[11px] uppercase tracking-luxe text-on-primary transition hover:bg-moss state-layer elevation-1"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Make another booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Compute the step rail progress markers ──
  const step1Done = !!(bookingDate && slot);
  const step2Done = !!(guestName && email);
  const step3Done = !!agreeToHouseRules;

  // Pretty-print the selected slot for the summary
  const slotLabel = slot
    ? slot.replace("-", " – ")
    : (slotsLoading ? "Checking…" : "Not picked yet");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="relative overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest elevation-3"
    >
      {/* ── Sage top accent bar with leaf glyph ── */}
      <div className="relative h-1.5 bg-gradient-to-r from-sage via-sage-soft to-sage">
        <span
          className="absolute left-6 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-lowest text-primary ring-1 ring-sage/40 elevation-1"
          aria-hidden="true"
        >
          <Icon name="eco" className="text-sm" filled />
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* ── LEFT: Step rail + live summary ── */}
        <aside className="border-b border-outline-variant bg-surface-container-low/60 p-6 lg:border-b-0 lg:border-r">
          <p className="font-sans text-[10px] uppercase tracking-luxe text-primary flex items-center gap-2">
            <span className="h-px w-5 bg-sage" />
            Booking steps
          </p>

          <ol className="mt-5 space-y-4">
            <StepRail
              num="01"
              title="Your visit"
              hint="Pick a date & slot"
              done={step1Done}
            />
            <StepRail
              num="02"
              title="Reach you"
              hint="Share your contact"
              done={step2Done}
            />
            <StepRail
              num="03"
              title="Confirm"
              hint="Agree to house rules"
              done={step3Done}
            />
          </ol>

          {/* Live summary card */}
          <div className="mt-6 rounded-2xl border border-outline-variant bg-surface-lowest p-4 elevation-1">
            <p className="font-sans text-[10px] uppercase tracking-luxe text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-sage">receipt_long</span>
              Your booking so far
            </p>
            <dl className="mt-3 space-y-2 text-xs">
              <SummaryRow icon="event" label="Date" value={bookingDate || "—"} />
              <SummaryRow icon="schedule" label="Slot" value={slotLabel} />
              <SummaryRow icon="person" label="Guest" value={guestName || "—"} />
              <SummaryRow icon="mail" label="Email" value={email || "—"} />
            </dl>
          </div>
        </aside>

        {/* ── RIGHT: Form sections ── */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* SECTION 01 — Your visit */}
          <FormSection
            num="01"
            icon="event_available"
            title="Your visit"
            subtitle="When would you like to arrive?"
          >
            <Field
              label="Booking date"
              error={errors.bookingDate?.message}
            >
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
                <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant animate-pulse">
                  <span className="material-symbols-outlined text-base text-outline animate-spin">
                    hourglass_top
                  </span>
                  <span>Fetching available time slots…</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-sm text-on-surface-variant">
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
                    {availableSlots.map((s) => (
                      <SelectItem key={`${s.start}-${s.end}`} value={`${s.start}-${s.end}`}>
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {s.start} – {s.end}
                          {s.price ? ` · $${s.price}` : ""}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
          </FormSection>

          {/* SECTION 02 — Reach you */}
          <FormSection
            num="02"
            icon="person"
            title="Reach you"
            subtitle="Where can the owner reply?"
          >
            <Field label="Your name" error={errors.guestName?.message}>
              <Input
                {...register("guestName")}
                autoComplete="name"
                placeholder="e.g. Ayesha Khan"
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
                  placeholder="you@email.com"
                  className="border-outline-variant bg-surface-container-low text-on-surface"
                  aria-invalid={!!errors.email}
                />
              </Field>
              <Field label="Phone (optional)" error={errors.phone?.message}>
                <Input
                  type="tel"
                  {...register("phone")}
                  autoComplete="tel"
                  placeholder="+92 3xx xxxxxxx"
                  className="border-outline-variant bg-surface-container-low text-on-surface"
                  aria-invalid={!!errors.phone}
                />
              </Field>
            </div>

            <Field
              label="Anything you'd like the owner to know? (optional)"
              error={errors.notes?.message}
              hint="Allergies, dietary needs, celebration details, accessibility, arrival logistics…"
            >
              <Textarea
                {...register("notes")}
                rows={3}
                className="border-outline-variant bg-surface-container-low text-on-surface resize-none"
                placeholder="We're celebrating my mother's 70th birthday — she loves orchids and jazz…"
              />
            </Field>
          </FormSection>

          {/* SECTION 03 — House rules + acknowledge */}
          <FormSection
            num="03"
            icon="gavel"
            title="Confirm"
            subtitle="Acknowledge the house rules"
          >
            <div className="rounded-2xl border border-outline-variant bg-secondary-container/25 p-5">
              <ul className="grid gap-2 text-xs text-on-surface-variant sm:grid-cols-2">
                {HOUSE_RULES.map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-sage mt-0.5">
                      check_circle
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>

              <label className="mt-4 flex cursor-pointer items-start gap-3 border-t border-outline-variant pt-4">
                <Checkbox
                  checked={agreeToHouseRules}
                  onCheckedChange={(v) => setValue("agreeToHouseRules", v === true, { shouldValidate: true })}
                  className="mt-0.5 border-outline data-[state=checked]:bg-sage data-[state=checked]:border-sage data-[state=checked]:text-on-primary"
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
          </FormSection>

          {/* Inline booking error */}
          {bookingError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl bg-error/10 p-4 text-sm text-error"
            >
              <span className="material-symbols-outlined text-base mt-0.5">error</span>
              <span>{bookingError}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky bottom action bar ── */}
      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-outline-variant bg-surface-lowest/95 px-6 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-sage">bolt</span>
          Goes <strong className="text-on-surface">directly to the owner</strong> · no middleman, no booking fee.
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          title={
            !isValid
              ? "Fill in all required fields and agree to the house rules to enable submit"
              : isSubmitting
                ? "Sending your booking…"
                : "Send your booking to the owner"
          }
          className={[
            "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 font-sans text-xs uppercase tracking-luxe transition-all state-layer",
            canSubmit
              ? "bg-sage text-on-primary elevation-2 hover:elevation-3 hover:bg-moss"
              : "bg-outline-variant text-on-surface-variant cursor-not-allowed opacity-70",
          ].join(" ")}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              Sending…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">send</span>
              Send my booking
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────
   Sub-components — step rail row, summary row, section, field
   ──────────────────────────────────────────────────────────── */

function StepRail({
  num,
  title,
  hint,
  done,
}: {
  num: string;
  title: string;
  hint: string;
  done: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold transition-all",
          done
            ? "bg-sage text-on-primary ring-2 ring-sage/30 ring-offset-2 ring-offset-surface-container-low"
            : "bg-surface-container-low text-on-surface-variant border border-outline-variant",
        ].join(" ")}
      >
        {done ? (
          <span className="material-symbols-outlined text-base">check</span>
        ) : (
          num
        )}
      </span>
      <div className="min-w-0">
        <p className={[
          "font-sans text-sm leading-tight transition-colors",
          done ? "text-on-surface" : "text-on-surface-variant",
        ].join(" ")}>
          {title}
        </p>
        <p className="font-sans text-[11px] text-on-surface-variant/70 leading-tight mt-0.5">
          {hint}
        </p>
      </div>
    </li>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="material-symbols-outlined text-sm text-sage mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="font-sans text-[9px] uppercase tracking-luxe text-on-surface-variant/70">
          {label}
        </dt>
        <dd className="text-xs text-on-surface truncate font-medium">{value}</dd>
      </div>
    </div>
  );
}

function FormSection({
  num,
  icon,
  title,
  subtitle,
  children,
}: {
  num: string;
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-5 min-w-0">
      <legend className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-soft/40 text-primary ring-1 ring-sage/30">
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </span>
        <span>
          <span className="block font-sans text-[10px] uppercase tracking-luxe text-primary">
            Step {num}
          </span>
          <span className="block font-display text-xl text-on-surface leading-tight">
            {title}
          </span>
        </span>
      </legend>
      <p className="text-xs text-on-surface-variant -mt-2">{subtitle}</p>
      <div className="h-px bg-outline-variant/60" />
      {children}
    </fieldset>
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
