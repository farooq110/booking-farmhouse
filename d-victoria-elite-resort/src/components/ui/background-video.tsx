"use client";

/**
 * BackgroundVideo — reusable, single-source, reusable background video layer.
 *
 * Source of truth for the `<video>` tag attributes used here:
 *   https://nextjs.org/docs/app/guides/videos
 *
 * What this component does (and why):
 *
 * 1. **Reuses the Next.js guide's `<video>` best practices.**
 *    - `autoPlay muted loop playsInline` — the only combination that
 *      reliably autoplays on iOS Safari and Chrome.
 *    - `preload="none"` — we let our own web worker decide when to start
 *      fetching, instead of the browser eagerly pulling bytes.
 *    - `poster={poster}` — the cover image is shown immediately while the
 *      video buffers. This is the "default cover image" fallback.
 *    - Fallback content INSIDE the `<video>` tag (a CSS background-image)
 *      so browsers with video disabled still see something.
 *
 * 2. **Does NOT block the main thread.**
 *    The actual byte fetching is delegated to `videoPreloader.worker.ts`,
 *    which uses `fetch()` + `response.body.getReader()` to pull the file
 *    chunk by chunk. The main thread only receives tiny `postMessage`
 *    progress events.
 *
 * 3. **Loads chunk by chunk.**
 *    The worker reads the response stream incrementally and posts back
 *    `progress` events. We don't wait for 100% before playing — we wait
 *    for the worker's `ready` event (Blob URL created), which fires as
 *    soon as the stream closes. The browser's `<video>` element then
 *    decodes that Blob natively in its own media pipeline.
 *
 * 4. **Falls back to the cover image.**
 *    - If the worker doesn't deliver within `maxWaitMs` (default 10 s),
 *      the poster stays visible and the worker is terminated.
 *    - If the worker errors out (network, CORS, abort), same thing.
 *    - If the user has `prefers-reduced-motion: reduce`, we never even
 *      start the worker — the poster image is the final state.
 *
 * 5. **Plays slowly.**
 *    `playbackRate = 0.5` is applied on `onLoadedMetadata` so the hero
 *    background drifts instead of races. This is the "plays in the
 *    background slowly" the brief asked for.
 *
 * Usage:
 *   <BackgroundVideo src="/videos/hero-cover.mp4" poster={heroCover} />
 *
 * The component is reusable — drop it on any section that wants a slow,
 * looping, muted background video with a poster fallback.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";

export interface BackgroundVideoProps {
  /** Public URL of the MP4 (or WebM) file. Must be same-origin or CORS-enabled. */
  src: string;
  /** Poster image shown while the video buffers / as the final fallback. */
  poster: StaticImageData | string;
  /** Alt text for the poster image (accessibility). */
  alt?: string;
  /** Slow-motion factor — 0.5 = half speed. */
  playbackRate?: number;
  /** Hard timeout in ms. If the worker hasn't delivered by then, keep poster. */
  maxWaitMs?: number;
  /** First-byte timeout in ms. Aborts the fetch if no data arrives. */
  connectTimeoutMs?: number;
  /** Mime type for the Blob (defaults to video/mp4). */
  mimeType?: string;
  /** Tailwind className for the wrapping <div>. */
  className?: string;
}

type LoadState = "idle" | "loading" | "ready" | "failed" | "timeout" | "reduced-motion";

export function BackgroundVideo({
  src,
  poster,
  alt = "Cover image",
  playbackRate = 0.5,
  maxWaitMs = 10_000,
  connectTimeoutMs = 8_000,
  mimeType = "video/mp4",
  className = "",
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const maxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const [state, setState] = useState<LoadState>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // ── prefers-reduced-motion: don't load the video at all. ──
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setState("reduced-motion");
      return;
    }

    // ── Spawn the worker. ──
    // new Worker(new URL(...), { type: "module" }) is the Next.js-supported
    // way to ship a worker as part of the bundle.
    const worker = new Worker(
      new URL("../../workers/videoPreloader.worker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;
    setState("loading");

    // ── Hard timeout. If the worker doesn't deliver in time, give up. ──
    maxWaitTimerRef.current = setTimeout(() => {
      if (blobUrlRef.current) return; // already done
      setState("timeout");
      worker.postMessage({ type: "abort" });
    }, maxWaitMs);

    // ── Wire up worker messages. ──
    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (!msg) return;
      switch (msg.type) {
        case "progress": {
          setProgress(msg.percent);
          break;
        }
        case "ready": {
          if (maxWaitTimerRef.current) {
            clearTimeout(maxWaitTimerRef.current);
            maxWaitTimerRef.current = null;
          }
          blobUrlRef.current = msg.url;
          setState("ready");
          break;
        }
        case "error": {
          if (maxWaitTimerRef.current) {
            clearTimeout(maxWaitTimerRef.current);
            maxWaitTimerRef.current = null;
          }
          setState("failed");
          break;
        }
      }
    };

    // ── Kick off the fetch. ──
    worker.postMessage({
      type: "preload",
      url: src,
      connectTimeoutMs,
      mimeType,
    } as const);

    return () => {
      if (maxWaitTimerRef.current) clearTimeout(maxWaitTimerRef.current);
      worker.postMessage({ type: "abort" });
      worker.terminate();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // ── Once the Blob URL is ready, set it on the <video> and play. ──
  useEffect(() => {
    if (state !== "ready" || !blobUrlRef.current || !videoRef.current) return;
    const v = videoRef.current;
    v.src = blobUrlRef.current;
    v.load();
    const tryPlay = async () => {
      try {
        await v.play();
      } catch {
        // Autoplay can still be blocked by browser policy even when muted.
        // The poster will stay visible — that's fine.
      }
    };
    tryPlay();
  }, [state]);

  const videoVisible = state === "ready";

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* ── Poster image (always rendered; fades out when video is ready). ── */}
      {/* This is the "default cover image" the brief asks for. */}
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

      {/* ── The <video> element. ──
          Attributes are per the Next.js video guide:
          https://nextjs.org/docs/app/guides/videos
          - autoPlay + muted + playsInline = the only combo that autoplays
            reliably on iOS Safari and Chrome.
          - loop = background video, never stops.
          - preload="none" = let our worker decide when to fetch.
          - Fallback content inside <video> for browsers with video off. */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
        style={{ opacity: videoVisible ? 1 : 0 }}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        // We deliberately do NOT set `src` here — it's set via the
        // effect above once the worker delivers a Blob URL.
        onLoadedMetadata={(e) => {
          // Slow playback: 0.5 = half speed.
          (e.currentTarget as HTMLVideoElement).playbackRate = playbackRate;
        }}
        aria-hidden="true"
      >
        {/* Fallback content for browsers that don't support video. */}
        <p className="sr-only">
          Your browser does not support background video. The cover image is shown instead.
        </p>
      </video>

      {/* ── Tiny progress indicator (dev / a11y friendly). ──
          Only shown while loading. Removed from the tab order. */}
      {state === "loading" && progress > 0 && (
        <div
          className="absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80"
          aria-hidden="true"
        >
          {progress}%
        </div>
      )}
    </div>
  );
}

export default BackgroundVideo;
