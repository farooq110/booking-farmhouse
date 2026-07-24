"use client";

/**
 * ServiceWorkerRegister — mounts a Service Worker for video Range streaming.
 *
 * The SW lives at /public/sw.js and is registered on first paint. Once
 * active, it intercepts requests to /videos/* and answers them with
 * HTTP Range-aware responses, letting the <video> element stream the
 * MP4 chunk-by-chunk natively.
 *
 * Why a client component:
 *   - `navigator.serviceWorker` only exists in the browser.
 *   - We register on mount (after hydration) so we don't block first paint.
 *
 * Where this is used:
 *   - Mounted once in `src/app/layout.tsx` so it's available on every page.
 */

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register in production OR when explicitly enabled. In dev,
    // Next.js' static server already supports Range requests on /public/*
    // files, so the SW isn't strictly needed — but registering it here
    // means we test the same code path that ships to production.
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          // Scope is the root so the SW can intercept any /videos/* request.
          scope: "/",
          // Don't let Next.js' HMR confuse the SW — use a sensible update hint.
          updateViaCache: "none",
        });
        // Wait for the SW to be active before declaring success.
        if (reg.active) {
          // eslint-disable-next-line no-console
          console.info("[SW] video streaming service worker active");
        } else {
          await new Promise((resolve) => {
            const check = () => {
              if (reg.active) {
                resolve(true);
              } else {
                setTimeout(check, 100);
              }
            };
            check();
          });
          // eslint-disable-next-line no-console
          console.info("[SW] video streaming service worker activated");
        }
      } catch (err) {
        // SW registration failed (e.g. insecure context, file:// origin).
        // The app still works — <video> will fall back to direct fetch,
        // which the browser still handles with Range requests natively.
        console.warn("[SW] service worker registration failed:", err);
      }
    };

    // Register on idle to avoid competing with first-paint work.
    if ("requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(register);
    } else {
      setTimeout(register, 1500);
    }
  }, []);

  return null;
}

export default ServiceWorkerRegister;
