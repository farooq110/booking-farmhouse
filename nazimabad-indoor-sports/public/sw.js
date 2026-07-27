/**
 * sw.js — D-Victoria Elite Service Worker
 *
 * Single responsibility: act as a RANGE-AWARE caching proxy for the hero
 * background video, so the browser's <video> element can stream the MP4
 * chunk-by-chunk on demand, natively, without a Blob assembly step.
 *
 * Why a Service Worker instead of the previous Web Worker approach:
 *   - The previous `videoPreloader.worker.ts` fetched the *entire* MP4
 *     into memory as a Blob, then handed a blob: URL to <video>. That's
 *     a 14 MB spike in RAM and blocks playback until the full file is
 *     downloaded.
 *   - With a Service Worker answering Range requests, <video> asks for
 *     "bytes 0-1048575" first (the moov atom + first frames), starts
 *     playing immediately, then asks for "bytes 1048576-..." as the
 *     playhead advances. Total memory: one chunk at a time.
 *   - This is exactly how YouTube, Netflix and every major video site
 *     stream. The Service Worker is invisible to the rest of the app —
 *     it sits between `fetch()` and the network.
 *
 * Scope: this SW only intercepts requests under `/videos/`. Everything
 * else (HTML, CSS, JS, images, fonts) passes through untouched.
 *
 * Caching strategy: `CacheFirst` with stale-while-revalidate semantics.
 *   - First request for a byte range: fetch from network, cache the
 *     partial response keyed by URL + range, return it.
 *   - Subsequent requests for the same range: serve from cache
 *     instantly, and revalidate in the background.
 *
 * Reference:
 *   https://nextjs.org/docs/app/guides/videos  — <video> tag attributes
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
 */

const SW_VERSION = "dve-video-sw-v1";
const VIDEO_CACHE = "dve-video-cache-v1";
const VIDEO_PATH_PREFIX = "/videos/";

// ── Install: activate immediately, don't wait for clients to close. ──
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

// ── Activate: claim all clients immediately so the SW takes effect
//    on the current page load, not just the next navigation. ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches from previous SW versions.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("dve-") && k !== VIDEO_CACHE && k !== SW_VERSION)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/**
 * Build a cache key that includes the byte range so we don't accidentally
 * serve a partial response to a different range request.
 */
function cacheKeyFor(url, range) {
  return range ? `${url}::range=${range}` : url;
}

/**
 * Fetch handler — only intercepts /videos/* requests.
 *
 * Strategy:
 *   1. If we have a cached response for this exact URL+range, return it
 *      immediately and revalidate in the background.
 *   2. Otherwise, fetch from the network, passing through the Range
 *      header so the server (or our static file server) returns 206
 *      Partial Content.
 *   3. Cache the network response (only if it's a 200 or 206 — we don't
 *      want to cache errors).
 *   4. Return the network response.
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET requests for /videos/*.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!url.pathname.startsWith(VIDEO_PATH_PREFIX)) return;

  event.respondWith(handleVideoRequest(req));
});

async function handleVideoRequest(req) {
  const cache = await caches.open(VIDEO_CACHE);
  const range = req.headers.get("range") || "";
  const key = cacheKeyFor(req.url, range);

  // ── 1. Cache lookup ──
  const cached = await cache.match(key);
  if (cached) {
    // Stale-while-revalidate: kick off a background fetch to refresh.
    fetchAndCache(req, key, cache).catch(() => {});
    return cached;
  }

  // ── 2. Network fetch (with Range passthrough) ──
  return fetchAndCache(req, key, cache);
}

/**
 * Fetches a video request from the network and caches the response.
 * Falls back to the cached full file (if any) on network failure.
 */
async function fetchAndCache(req, key, cache) {
  try {
    // Clone the request because we'll need to read its headers when
    // forwarding, and the original might be consumed.
    const netRes = await fetch(req, {
      // Critical: forward the Range header so we get 206 Partial Content.
      headers: req.headers,
      // Don't use the browser cache — we manage our own.
      cache: "no-store",
    });

    // Only cache successful responses. 200 (full file) and 206 (partial)
    // are both valid for video.
    if (netRes.ok || netRes.status === 206) {
      // We must clone before putting in the cache, because the body
      // stream can only be consumed once.
      cache.put(key, netRes.clone());
    }
    return netRes;
  } catch (err) {
    // Network failed entirely. Try to serve any cached response for
    // this URL (ignoring the range) as a last resort.
    const anyCached = await cache.match(req.url, { ignoreSearch: true });
    if (anyCached) return anyCached;
    throw err;
  }
}

// ── Message handler — lets the page ask the SW for its status. ──
self.addEventListener("message", (event) => {
  if (event.data?.type === "SW_STATUS") {
    event.source?.postMessage({
      type: "SW_STATUS",
      version: SW_VERSION,
      ready: true,
    });
  }
});
