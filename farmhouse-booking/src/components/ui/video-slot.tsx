"use client";
import { MediaSlot } from "./media-slot";

export interface VideoSlotProps {
  /** CDN URL for the cinematic loop — swap in your real .mp4/.webm here */
  src?: string;
  poster?: string;
  className?: string;
  /** Show a play icon hint */
  showPlayHint?: boolean;
}

/**
 * VideoSlot — dedicated structural slot for the hero background video loop
 * and any cinematic video carousel placeholders elsewhere on the page.
 *
 * Without a src it renders a slow-shimmer cream placeholder so the
 * page still feels alive in dev. With a src it lazy-mounts a muted,
 * autoplaying, looping video that respects prefers-reduced-motion.
 */
export function VideoSlot({
  src,
  poster,
  className = "",
  showPlayHint = false,
}: VideoSlotProps) {
  if (!src) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-surface-high via-surface-mid to-surface-high ${className}`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 grain-overlay" />
        <div
          className="absolute -inset-1/4 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, oklch(0.88 0.04 145 / 0.45) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, oklch(0.92 0.07 75 / 0.35) 0%, transparent 60%)",
            animation: "shimmer 18s ease-in-out infinite alternate",
          }}
        />
        <style>{`@keyframes shimmer { 0% { transform: translate(-2%, -2%) scale(1); } 100% { transform: translate(2%, 2%) scale(1.05); } }`}</style>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">
            movie
          </span>
          <span className="font-display text-lg text-on-surface-variant/50 tracking-wide-luxe">
            Elixir Arena
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>
      {showPlayHint && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-lowest/85 backdrop-blur-sm elevation-3">
            <span
              className="material-symbols-outlined text-2xl text-primary"
              style={{ fontVariationSettings: '"FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24' }}
            >
              play_arrow
            </span>
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/10 via-transparent to-charcoal/40" />
    </div>
  );
}

/** Video carousel cell — same visual language as VideoSlot but labelled. */
export function VideoCarouselCell({
  src,
  label,
  poster,
}: {
  src?: string;
  label: string;
  poster?: string;
}) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl elevation-2">
      <VideoSlot src={src} poster={poster} showPlayHint={!!src} className="h-full w-full" />
      <div className="absolute bottom-3 left-4 z-10">
        <span className="font-display text-lg text-on-surface">{label}</span>
      </div>
    </div>
  );
}

export { MediaSlot };
