"use client";
import { useSyncExternalStore } from "react";

/**
 * Returns true when the user prefers reduced motion.
 * Re-evaluates if the OS-level preference changes.
 *
 * Uses useSyncExternalStore — the React 19 idiomatic way to subscribe
 * to an external value (media-query). Avoids setState-in-effect warnings
 * and is SSR-safe (server snapshot is always `false`).
 */
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener?.("change", callback);
  return () => mq.removeEventListener?.("change", callback);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
