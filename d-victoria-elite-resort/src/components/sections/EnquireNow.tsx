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
 * directly to the farmhouse owner.
 *
 * This is NOT a modal. The form lives in the page so guests can scan the
 * fields without clicking anything first. The form is the section.
 */
export function EnquireNow() {
  return (
    <section
      id="enquire-now"
      className="relative scroll-mt-20 bg-surface-container-lowest py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          {/* ── Left column: pitch + reassurance ── */}
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <SectionLabel>Enquire Directly</SectionLabel>
            <SectionHeading>
              Tell the owner when you'd like
              <span className="text-moss-gradient italic"> to arrive.</span>
            </SectionHeading>
            <p className="mt-6 text-base sm:text-lg text-on-surface-variant text-pretty leading-relaxed">
              Country Farm is owned and hosted by one family. Your enquiry lands
              directly in their inbox — no middleman, no booking fee. Reply within
              24 hours.
            </p>

            <ul className="mt-8 space-y-3">
              {REASSURANCE_POINTS.map((p) => (
                <li key={p.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container">
                    <span className="material-symbols-outlined text-base text-on-primary-container">
                      {p.icon}
                    </span>
                  </span>
                  <span className="text-sm text-on-surface">{p.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-outline-variant bg-surface-container-low p-5">
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
          </div>

          {/* ── Right column: the form ──
              id="booking-form" is the scroll target for the header's
              "Booking Slots" button — it lands ON the form (not the
              "Tell the owner" pitch on the left).
              scroll-mt-24 clears the sticky header (h-16 = 4rem + 8px). */}
          <div id="booking-form" className="min-w-0 scroll-mt-24">
            <GuestEnquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
