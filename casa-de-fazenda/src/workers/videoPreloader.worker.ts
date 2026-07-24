/**
 * videoPreloader.worker.ts — fetches a video file in CHUNKS, off the main thread.
 *
 * Why a worker:
 *   - Reading a multi-MB response body via `response.body.getReader()` is
 *     pure CPU work (chunk accumulation, ArrayBuffer copying). Doing it on
 *     the main thread can jank the hero animation.
 *   - The worker posts progress back so the UI can show a fallback poster
 *     until enough has buffered, and times out gracefully if the network
 *     is too slow.
 *
 * What it does NOT do:
 *   - It does NOT decode video frames. The browser's <video> element still
 *     does that, natively, in its own media pipeline. We only fetch bytes.
 *
 * Result:
 *   - On success: posts `{ type: "ready", url }` where `url` is a Blob URL
 *     the <video> can use directly. The browser still streams from the Blob
 *     internally so playback starts as soon as the first chunk is in.
 *   - On progress: posts `{ type: "progress", loaded, total, percent }`.
 *   - On error / abort: posts `{ type: "error", reason }`.
 */
/// <reference lib="webworker" />

export interface VideoPreloadRequest {
  type: "preload";
  url: string;
  /** Abort if the first byte hasn't arrived within this many ms. */
  connectTimeoutMs?: number;
  /** Mime type used when constructing the Blob (defaults to video/mp4). */
  mimeType?: string;
}

export type VideoPreloadMessage =
  | { type: "progress"; loaded: number; total: number; percent: number }
  | { type: "ready"; url: string; size: number; durationMs: number }
  | { type: "error"; reason: "fetch" | "timeout" | "abort" | "unknown"; message?: string };

self.onmessage = async (e: MessageEvent<VideoPreloadRequest>) => {
  const msg = e.data;
  if (!msg || msg.type !== "preload") return;

  const { url, connectTimeoutMs = 8000, mimeType = "video/mp4" } = msg;
  const startedAt = performance.now();

  // AbortController — lets the main thread cancel an in-flight load
  // (e.g. when the user navigates away or the component unmounts).
  const controller = new AbortController();
  const connectTimer = setTimeout(() => {
    controller.abort();
    postMessage({
      type: "error",
      reason: "timeout",
      message: `First byte not received within ${connectTimeoutMs}ms`,
    } satisfies VideoPreloadMessage);
  }, connectTimeoutMs);

  // Allow the main thread to cancel.
  self.addEventListener("message", function onAbort(ev) {
    const m = ev.data as { type: "abort" };
    if (m?.type === "abort") {
      controller.abort();
      self.removeEventListener("message", onAbort);
    }
  });

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      // Ask the browser to follow redirects (Jumpshare-style CDNs redirect).
      redirect: "follow",
      // Hint that we want a streaming response.
      cache: "no-store",
    });
    if (!response.ok) {
      clearTimeout(connectTimer);
      postMessage({
        type: "error",
        reason: "fetch",
        message: `HTTP ${response.status} ${response.statusText}`,
      } satisfies VideoPreloadMessage);
      return;
    }
    if (!response.body) {
      // Server didn't give us a stream — fall back to a single read.
      clearTimeout(connectTimer);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      postMessage({
        type: "ready",
        url: blobUrl,
        size: blob.size,
        durationMs: Math.round(performance.now() - startedAt),
      } satisfies VideoPreloadMessage);
      return;
    }

    const reader = response.body.getReader();
    const total = Number(response.headers.get("Content-Length")) || 0;
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    // Read the stream chunk by chunk.
    // Each `read()` resolves as soon as a buffer fills — we don't wait for
    // the whole file. The first chunk clears the connect timer (we know
    // the server is actually sending data).
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.byteLength;
        clearTimeout(connectTimer);
        postMessage({
          type: "progress",
          loaded,
          total,
          percent: total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0,
        } satisfies VideoPreloadMessage);
      }
    }

    // Assemble the final Blob. We hold all chunks in memory — for a
    // ~13 MB hero video this is fine. For larger files, switch to
    // Service Worker + Range requests (out of scope here).
    const blob = new Blob(chunks as BlobPart[], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    postMessage({
      type: "ready",
      url: blobUrl,
      size: blob.size,
      durationMs: Math.round(performance.now() - startedAt),
    } satisfies VideoPreloadMessage);
  } catch (err) {
    clearTimeout(connectTimer);
    const e = err as Error;
    if (e?.name === "AbortError") {
      postMessage({ type: "error", reason: "abort", message: e.message } satisfies VideoPreloadMessage);
    } else {
      postMessage({ type: "error", reason: "unknown", message: e?.message } satisfies VideoPreloadMessage);
    }
  }
};
