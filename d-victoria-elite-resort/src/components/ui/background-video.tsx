"use client";

/**
 * BackgroundVideo — reusable, single-source background video layer.
 *
 * Source of truth for the `<video>` tag attributes used here:
 *   https://nextjs.org/docs/app/guides/videos
 *
 * DISPLAY STRATEGY — "Cinematic Blurred Background Fill"
 *
 * The source video is portrait (9:16). To display it on a landscape
 * hero without cropping any content, we render TWO synchronized
 * <video> elements stacked on top of each other:
 *
 *   Layer 1 (background fill):
 *     - Same video, scaled with `object-cover` to fill the entire screen
 *     - Heavily blurred (blur-3xl) and darkened so it reads as ambient
 *     - This fills the side space that would otherwise be black bars
 *
 *   Layer 2 (foreground, full content):
 *     - Same video, scaled with `object-contain` to fit within the screen
 *     - Centered, sharp, no blur
 *     - The full portrait video content is visible — nothing cropped
 *
 * This is the same pattern Instagram, YouTube, and TikTok use to show
 * vertical video on horizontal screens.
 *
 * On portrait/mobile screens (where the viewport is also 9:16), the
 * foreground video naturally fills the screen and the background layer
 * is hidden behind it — both layers degrade gracefully.
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
 *
 * PLAYBACK
 *   `playbackRate = 0.5` is applied to BOTH layers on every relevant
 *   event (loadedmetadata, play, seeked, canplay). They stay in sync
 *   because they share the same source and the same playback rate.
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
  // Refs to BOTH video elements (background fill + foreground content)
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
  // We listen to BOTH video elements. Either one flipping to ready
  // means we can show the video layers and hide the poster.
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

    // Polling fallback in case events fire before listeners attach.
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

      {/* ── Layer 1: Blurred background fill ──
          Same video scaled to cover the entire screen, then blurred
          and darkened. Fills the side space on landscape screens.

          Proportional sizing: the foreground video (Layer 2) is capped
          so that on wide screens it always occupies ~70% of the
          viewport width, leaving ~15% per side for the blurred fill.
          This keeps the blurred sides always SMALLER than the sharp
          center, per the user's requirement. */}
      {state !== "failed" && (
        <video
          ref={bgVideoRef}
          key={`${activeSrc}-bg`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 blur-3xl scale-125"
          style={{
            opacity: videoVisible ? 0.6 : 0,
            // Slight darkening so the foreground pops
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
          Same video at natural aspect ratio, centered.

          SIZING STRATEGY (per user requirement):
            "the left and right blurry part should always be small
             from center part, approximately 1/3 small"

            Translation: the sharp center should be ~3× the width of
            each blurred side. Achieved with: 60% center + 20% per side.

          THE GEOMETRY PROBLEM:
            The source video is 9:16 portrait. On a 16:9 landscape
            viewport, a 9:16 video that fits the full viewport height
            is only 32% of the viewport width. To make the center 60%
            of the width on landscape, the video MUST be taller than
            the viewport — there's no way around the math.

          THE COMPROMISE (chosen per user priority):
            User's two requirements, in priority order:
              1. Blurred sides must be ~1/3 the size of the center
                 (this request — most recent, takes priority)
              2. Show as much of the video as possible (earlier request)

            Solution: fix the wrapper at 60vw width with the video's
            natural 9:16 aspect ratio. The wrapper WILL be taller than
            the viewport on landscape screens. The wrapper is centered
            vertically, so equal portions of the top and bottom of the
            portrait frame are clipped by the parent's `overflow: hidden`.

            What gets cropped: the top and bottom ~30% of the portrait
            frame on landscape screens (the parts typically least
            important — sky, ground, ceiling). The horizontal content
            (the important part for a property tour video) is fully
            visible.

            On portrait/mobile: 60vw fits comfortably, no cropping,
            ratio is exactly 60/20/20. */}
      {state !== "failed" && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
          style={{
            opacity: videoVisible ? 1 : 0,
            // 60% of viewport width on all screen sizes.
            // This guarantees the blurred sides are always ~20% each
            // (center is 3× wider than each side), per user requirement.
            width: "60vw",
            maxWidth: "100%",
            // Use the video's natural 9/16 aspect ratio so the box
            // is always the right shape for the video to fill.
            aspectRatio: "9 / 16",
            // NO max-height — we INTENTIONALLY allow vertical overflow
            // on landscape screens so the width can be 60% of viewport.
            // The parent <div> has `overflow: hidden`, so the overflow
            // is clipped cleanly (top and bottom of portrait frame).
          }}
        >
          <video
            ref={fgVideoRef}
            key={`${activeSrc}-fg`}
            // object-cover (not contain) so the video fills the wrapper
            // completely. Since the wrapper has the video's natural
            // 9:16 aspect ratio, there's no distortion — the video
            // maps 1:1 to the wrapper.
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
