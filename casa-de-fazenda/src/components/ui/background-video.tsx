"use client";

/**
 * BackgroundVideo — reusable, single-source background video layer.
 *
 * DISPLAY STRATEGY — "Cinematic Blurred Background Fill"
 *
 * The source video is portrait (9:16). We render ONE foreground
 * <video> element at natural aspect ratio, centered, sharp. The side
 * space that would otherwise be black bars is filled by the poster
 * image, scaled to cover and blurred — no second <video> needed.
 *
 * MOBILE vs DESKTOP SIZING:
 *   All viewports: foreground = 80vw → 80% center + 10% blur per side.
 *   The video fills the viewport height; only left/right have the
 *   blurred poster-image fill visible.
 *
 * STREAMING
 *   Only ONE <video> element is mounted, so the browser issues exactly
 *   one set of Range requests for the MP4. The Service Worker
 *   (/public/sw.js) caches Range responses (cache-first) so subsequent
 *   page loads serve the video entirely from cache — zero network.
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
    const v = videoRef.current;
    if (!v) return;

    const applyRate = () => {
      v.playbackRate = playbackRate;
    };

    const markReady = () => {
      setState((prev) => (prev === "ready" ? prev : "ready"));
    };

    const onLoadedMetadata = () => { applyRate(); markReady(); };
    const onCanPlay = () => { applyRate(); markReady(); };
    const onPlaying = () => { applyRate(); markReady(); };
    const onPlay = () => { applyRate(); markReady(); };
    const onSeeked = () => { applyRate(); };

    v.addEventListener("loadedmetadata", onLoadedMetadata);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("play", onPlay);
    v.addEventListener("seeked", onSeeked);

    let pollCount = 0;
    const poll = setInterval(() => {
      pollCount++;
      if (v.readyState >= 2) {
        applyRate();
        markReady();
      }
      if (v.readyState >= 3 || pollCount > 300) {
        clearInterval(poll);
      }
    }, 100);

    return () => {
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("seeked", onSeeked);
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
          have the blurred poster-image fill visible. */}
      <style>{`
        [data-fg-video-wrapper] {
          width: 80vw !important;
          height: 100% !important;
          max-height: 100% !important;
          aspect-ratio: unset !important;
        }
      `}</style>

      {/* ── Layer 1: Blurred backdrop fill (poster image, no second <video>). ──
          Reuses the already-loaded poster image — zero extra network.
          Heavily blurred + darkened so the foreground video reads as the
          focal point. Hidden once the video is ready (foreground fills
          the centre; sides still see this blurred fill). */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 blur-3xl scale-125"
        style={{
          opacity: videoVisible ? 0.6 : 1,
          filter: "brightness(0.5) saturate(1.1)",
        }}
        aria-hidden="true"
      >
        <Image
          src={poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* ── Layer 2: Foreground video, FULL CONTENT ──
          ALL screens: 80vw width, full height, 10% blur per side.
          The blurred backdrop (Layer 1) shows through on the
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
            ref={videoRef}
            key={activeSrc}
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

      {/* ── Final fallback: poster image shown only if video fails ── */}
      {state === "failed" && (
        <div className="absolute inset-0">
          <Image
            src={poster}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}

export default BackgroundVideo;
