"use client";
import dynamic from "next/dynamic";
import { SectionHeading, SectionLabel } from "@/components/ui/luxury-primitives";
import { GuestEnquiryFormSkeleton } from "@/components/ui/loading-skeleton";
import { FARMHOUSE } from "@/data/media";

// Dynamically import the form with ssr: false to avoid any hydration issues
// from the useEffect + requestAnimationFrame + useWatch combination.
// Shows a structured skeleton placeholder while loading for better UX.
const GuestEnquiryForm = dynamic(
  () =>
    import("@/components/forms/GuestEnquiryForm").then((m) => m.GuestEnquiryForm),
  {
    ssr: false,
    loading: () => <GuestEnquiryFormSkeleton />,
  }
);

const REASSURANCE_POINTS = [
  { icon: "bolt", label: "Direct to the owner — no middleman" },
  { icon: "payments", label: "No booking fee, no commission" },
  { icon: "schedule", label: "Personal reply within 24 hours" },
  { icon: "handshake", label: "Flexible dates negotiated with the owner" },
];

/**
 * EnquireNow — inline enquiry section where guests send a stay request
 * directly to the White Villa FarmHouse owner.
 *
 * Layout v2 — single-column stacked:
 *   1. Section heading + pitch
 *   2. Reassurance points (4 icons + labels)
 *   3. "Prefer to speak with the owner?" contact box
 *   4. The booking form (below the contact box)
 *
 * Distinct from the previous 2-column (pitch-left / form-right) layout.
 * The form now sits BELOW the "Prefer to speak" box so the contact info
 * reads as a fallback before the user commits to filling the form.
 */
export function EnquireNow() {
  return (
    <section
      id="enquire-now"
      className="relative scroll-mt-20 bg-surface-container-lowest py-28 sm:py-36"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* ── 1. Heading + pitch ── */}
        <div className="text-center">
          <SectionLabel>Enquire Directly</SectionLabel>
          <SectionHeading>
            Tell the owner when you'd like
            <span className="text-sage-gradient italic"> to arrive.</span>
          </SectionHeading>
          <p className="mt-6 text-base sm:text-lg text-on-surface-variant text-pretty leading-relaxed">
            White Villa FarmHouse is owned and hosted by one family. Your
            enquiry lands directly in their inbox — no middleman, no booking
            fee. Reply within 24 hours.
          </p>
        </div>

        {/* ── 2. Reassurance points ── */}
        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {REASSURANCE_POINTS.map((p) => (
            <li
              key={p.label}
              className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-low p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container">
                <span className="material-symbols-outlined text-base text-on-primary-container">
                  {p.icon}
                </span>
              </span>
              <span className="text-sm text-on-surface">{p.label}</span>
            </li>
          ))}
        </ul>

        {/* ── 3. "Prefer to speak with the owner?" contact box ── */}
        <div className="mt-8 rounded-2xl border border-sage/30 bg-sage-soft/15 p-6">
          <p className="font-display text-lg text-on-surface">
            Prefer to speak with the owner?
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Call{" "}
            <a
              href={FARMHOUSE.phoneHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {FARMHOUSE.phone}
            </a>{" "}
            or email{" "}
            <a
              href={FARMHOUSE.emailHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {FARMHOUSE.email}
            </a>
            .
          </p>
        </div>

        {/* ── 4. The booking form ──
            id="booking-form" is the scroll target for the header's
            "Booking Slots" button — it lands ON the form.
            scroll-mt-24 clears the sticky header (h-16 = 4rem + 8px). */}
        <div id="booking-form" className="mt-8 scroll-mt-24">
          <GuestEnquiryForm />
        </div>
      </div>
    </section>
  );
}
