"use client";

/**
 * BackgroundVideo — reusable, single-source background video layer.
 *
 * DISPLAY STRATEGY — "Cinematic Blurred Background Fill"
 *
 * The source video is portrait (9:16). We render TWO synchronized
 * <video> elements stacked:
 *
 *   Layer 1 (background fill): same video, scaled to cover, blurred,
 *     darkened. Fills the side space that would otherwise be black bars.
 *
 *   Layer 2 (foreground, full content): same video at natural aspect ratio,
 *     centered, sharp, no blur.
 *
 * MOBILE vs DESKTOP SIZING:
 *   Desktop (landscape, ≥641px): foreground = 60vw → 60% center + 20% blur
 *     per side. The 9:16 video at 60vw is taller than the viewport, so
 *     top/bottom are clipped — only left/right blur is visible.
 *
 *   Mobile (portrait, ≤640px): foreground = 80vw → 80% center + 10% blur
 *     per side. The video fills the viewport height naturally. Blur only
 *     appears on the LEFT and RIGHT (10% each), NOT surrounding the whole
 *     video. The video is NOT cropped on mobile.
 *
 * STREAMING
 *   Both video elements share the same `src`. The Service Worker
 *   (/public/sw.js) caches Range responses, so the second <video>
 *   element's requests hit the cache instantly — no double download.
 *
 * FALLBACKS
 *   - If the video element fires `onError`, we try `fallbackSrc`, then
 *     give up and show the poster permanently.
 *   - If the user has `prefers-reduced-motion: reduce`, we never even
 *     set the `src` — the poster image is the final state.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";

export interface BackgroundVideoProps {
  /** Primary video URL (MP4 or WebM). Served via SW Range requests. */
  src: string;
  /** Secondary URL tried if the primary fails (e.g. smaller portrait MP4). */
  fallbackSrc?: string;
  /** Poster image shown while the video buffers / as the final fallback. */
  poster: StaticImageData | string;
  /** Alt text for the poster image (accessibility). */
  alt?: string;
  /** Slow-motion factor — 0.5 = half speed. */
  playbackRate?: number;
  /** Tailwind className for the wrapping <div>. */
  className?: string;
}

type LoadState = "idle" | "loading" | "ready" | "failed";

export function BackgroundVideo({
  src,
  fallbackSrc,
  poster,
  alt = "Cover image",
  playbackRate = 0.5,
  className = "",
}: BackgroundVideoProps) {
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const fgVideoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [activeSrc, setActiveSrc] = useState<string>(src);

  useEffect(() => {
    setActiveSrc(src);
    setState("idle");
  }, [src]);

  // ── prefers-reduced-motion: don't load the video at all. ──
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setState("failed");
      return;
    }
    setState("loading");
  }, []);

  // ── Robust ready-detection. ──
  useEffect(() => {
    const videos = [bgVideoRef.current, fgVideoRef.current].filter(Boolean) as HTMLVideoElement[];
    if (videos.length === 0) return;

    const markReady = () => {
      setState((prev) => (prev === "ready" ? prev : "ready"));
    };

    const applyRate = (v: HTMLVideoElement) => {
      v.playbackRate = playbackRate;
    };

    const handlers: Array<[HTMLVideoElement, string, () => void]> = [];
    for (const v of videos) {
      const onLoadedMetadata = () => { applyRate(v); markReady(); };
      const onCanPlay = () => { applyRate(v); markReady(); };
      const onPlaying = () => { applyRate(v); markReady(); };
      const onPlay = () => { applyRate(v); markReady(); };
      const onSeeked = () => { applyRate(v); };

      v.addEventListener("loadedmetadata", onLoadedMetadata);
      v.addEventListener("canplay", onCanPlay);
      v.addEventListener("playing", onPlaying);
      v.addEventListener("play", onPlay);
      v.addEventListener("seeked", onSeeked);

      handlers.push(
        [v, "loadedmetadata", onLoadedMetadata],
        [v, "canplay", onCanPlay],
        [v, "playing", onPlaying],
        [v, "play", onPlay],
        [v, "seeked", onSeeked]
      );
    }

    let pollCount = 0;
    const poll = setInterval(() => {
      pollCount++;
      const anyReady = videos.some((v) => v.readyState >= 2);
      if (anyReady) {
        videos.forEach(applyRate);
        markReady();
      }
      if (videos.some((v) => v.readyState >= 3) || pollCount > 300) {
        clearInterval(poll);
      }
    }, 100);

    return () => {
      for (const [v, ev, fn] of handlers) {
        v.removeEventListener(ev, fn);
      }
      clearInterval(poll);
    };
  }, [activeSrc, playbackRate]);

  // ── Error handler: try the fallback source, then give up. ──
  const handleError = () => {
    if (activeSrc !== fallbackSrc && fallbackSrc) {
      setActiveSrc(fallbackSrc);
      setState("loading");
    } else {
      setState("failed");
    }
  };

  const videoVisible = state === "ready";

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Inline styles for the foreground video wrapper.
          ALL screen sizes: 80% width, 10% blur per side.
          The video fills the full viewport height; only left/right
          have the blurred background fill visible. */}
      <style>{`
        [data-fg-video-wrapper] {
          width: 80vw !important;
          height: 100% !important;
          max-height: 100% !important;
          aspect-ratio: unset !important;
        }
      `}</style>

      {/* ── Poster image (always rendered; fades out when video is ready). ── */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: videoVisible ? 0 : 1 }}
        aria-hidden={videoVisible}
      >
        <Image
          src={poster}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* ── Layer 1: Blurred background fill ── */}
      {state !== "failed" && (
        <video
          ref={bgVideoRef}
          key={`${activeSrc}-bg`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 blur-3xl scale-125"
          style={{
            opacity: videoVisible ? 0.6 : 0,
            filter: "brightness(0.5) saturate(1.1)",
          }}
          src={activeSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onError={handleError}
          aria-hidden="true"
        />
      )}

      {/* ── Layer 2: Foreground video, FULL CONTENT ──
          ALL screens: 80vw width, full height, 10% blur per side.
          The blurred background fill (Layer 1) shows through on the
          left and right 10% gaps. */}
      {state !== "failed" && (
        <div
          data-fg-video-wrapper="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
          style={{
            opacity: videoVisible ? 1 : 0,
          }}
        >
          <video
            ref={fgVideoRef}
            key={`${activeSrc}-fg`}
            className="h-full w-full object-cover"
            src={activeSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            onError={handleError}
            aria-hidden="true"
          >
            <p className="sr-only">
              Your browser does not support background video. The cover image is shown instead.
            </p>
          </video>
        </div>
      )}
    </div>
  );
}

export default BackgroundVideo;
