"use client";
import { SectionHeading, SectionLabel } from "@/components/ui/luxury-primitives";
import { FARMHOUSE } from "@/data/media";

interface DetailRow {
  icon: string;
  label: string;
  value: string;
}

const DETAILS: DetailRow[] = [
  { icon: "location_on", label: "Address", value: FARMHOUSE.address },
  { icon: "login", label: "Check-in", value: "3:00 PM — 6:00 PM" },
  { icon: "logout", label: "Check-out", value: "11:00 AM" },
  { icon: "call", label: "Phone", value: FARMHOUSE.phone },
  { icon: "support_agent", label: "On-site host", value: "Owner lives on the property" },
];

export function Location() {
  return (
    <section id="location" className="relative bg-surface-container py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto max-w-3xl text-center">
          <SectionLabel>Location & Arrival</SectionLabel>
          <SectionHeading>
            Easy to find,
            <span className="text-moss-gradient italic"> easy to reach.</span>
          </SectionHeading>
          <p className="mt-6 text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Summer Land Farm House is in Gadap Town, Karachi — easy to reach from the city.
          </p>
        </header>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Google Maps embed — live, interactive */}
          <figure className="relative">
            <div className="overflow-hidden rounded-3xl border border-outline-variant elevation-2">
              <iframe
                title="Summer Land Farm House location on Google Maps"
                src={FARMHOUSE.mapsEmbed}
                className="h-[400px] w-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <a
              href={FARMHOUSE.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 elevation-2 transition hover:elevation-3 state-layer"
            >
              <span className="material-symbols-outlined text-base text-on-primary">directions</span>
              <span className="font-sans text-[10px] uppercase tracking-luxe text-on-primary">
                Open in Google Maps
              </span>
            </a>
          </figure>

          {/* Detail block */}
          <div className="flex flex-col justify-center">
            <dl className="divide-y divide-outline-variant rounded-3xl bg-surface-container-low p-2 elevation-1">
              {DETAILS.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[140px_1fr] sm:gap-4"
                >
                  <dt className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-luxe text-primary">
                    <span className="material-symbols-outlined text-base text-primary">
                      {row.icon}
                    </span>
                    {row.label}
                  </dt>
                  <dd className="text-sm text-on-surface leading-relaxed">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-primary-container/40 p-5">
              <span className="material-symbols-outlined text-xl text-on-primary-container">
                lock
              </span>
              <div>
                <p className="font-display text-lg text-on-surface">
                  Gate access on arrival
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  The owner will share the gate code and meet you at check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
