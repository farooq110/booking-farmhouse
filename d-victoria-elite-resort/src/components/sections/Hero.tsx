"use client";
import { SectionLabel, Icon } from "@/components/ui/luxury-primitives";
import { BackgroundVideo } from "@/components/ui/background-video";
import { MEDIA, FARMHOUSE } from "@/data/media";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
    >
      {/* D-Victoria Elite cover VIDEO (full-bleed background).
          - Self-hosted MP4 served from /public/videos/hero-cover-landscape.mp4
            (1920×1080 landscape H.264, 14 MB).
          - Streams chunk-by-chunk via the Service Worker at /public/sw.js,
            which answers HTTP Range requests so the browser only pulls
            the bytes it needs (no Blob assembly, no main-thread fetch).
          - Falls back to the smaller portrait MP4 if the landscape
            version fails, then to the cover image if both fail.
          - <video> attributes per the Next.js video guide:
            https://nextjs.org/docs/app/guides/videos */}
      <div className="absolute inset-0 -z-20">
        <BackgroundVideo
          src={MEDIA.hero.videoSrc}
          fallbackSrc={MEDIA.hero.videoFallbackSrc}
          poster={MEDIA.hero.cover}
          alt={`${FARMHOUSE.name} — a private resort estate in Gadap Town, Karachi`}
          playbackRate={0.5}
        />
      </div>

      {/* Subtle dark gradient so cream text stays legible over the photo */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.20 0.018 145 / 0.55) 0%, oklch(0.20 0.018 145 / 0.35) 50%, oklch(0.20 0.018 145 / 0.75) 100%)",
        }}
      />

      {/* 3D windmill as a subtle background element */}
      <HeroBackground3DWrapper />

      {/* Foreground content */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
        <SectionLabel className="text-cream/90">
          <span className="h-px w-6 bg-amber-soft" />
          {FARMHOUSE.name} · Private Resort · Karachi
        </SectionLabel>

        <h1 className="font-display font-medium text-balance text-cream leading-[1.02] text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem]">
          Welcome to our
          <br />
          <span className="text-gold-gradient italic">D-Victoria Elite.</span>
        </h1>

        <p className="mt-7 max-w-xl text-base sm:text-lg text-cream/85 text-pretty leading-relaxed">
          A private resort in Gadap Town, Karachi. Pool, gardens,
          gaming, and sports facilities — for your family, friends, and
          quiet weekends. Book directly with the owner.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#booking-form"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-tertiary px-8 py-3.5 font-sans text-xs uppercase tracking-luxe text-on-tertiary transition-all hover:bg-amber-soft elevation-1 hover:elevation-2 state-layer"
          >
            <Icon name="event_available" className="text-base" />
            Book Your Slot
          </a>
          <a
            href="#estate"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/40 px-8 py-3.5 font-sans text-xs uppercase tracking-luxe text-cream transition-all hover:bg-cream/10 hover:text-cream state-layer"
          >
            <Icon name="arrow_downward" className="text-base" />
            Explore the Estate
          </a>
        </div>

        {/* Trust strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-cream/75">
          <TrustItem icon="handshake" label="Owned & hosted by one family" />
          <TrustItem icon="bolt" label="Book directly with us" />
          <TrustItem icon="payments" label="No booking fees" />
          <TrustItem icon="call" label={FARMHOUSE.phone} />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <a
          href="#estate"
          className="flex h-10 w-6 items-start justify-center rounded-full border border-cream/40 p-1.5 transition hover:border-cream"
          aria-label="Scroll to explore the estate"
        >
          <div className="h-2 w-1 rounded-full bg-amber-soft animate-bounce" />
        </a>
      </div>
    </section>
  );
}

function TrustItem({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="material-symbols-outlined text-base text-amber-soft">{icon}</span>
      <span className="font-sans text-[11px] uppercase tracking-wide-luxe">{label}</span>
    </span>
  );
}

/**
 * Mounts the 3D windmill as a hero-only background element.
 * Dynamically imported so Three.js never touches the server.
 */
import dynamic from "next/dynamic";
const HeroBackground3D = dynamic(
  () =>
    import("@/components/three/HeroBackgroundWindmill").then(
      (m) => m.HeroBackgroundWindmill
    ),
  { ssr: false, loading: () => null }
);
const HeroBackground3DWrapper = () => <HeroBackground3D />;
