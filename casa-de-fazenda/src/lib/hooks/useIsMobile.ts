"use client";
import { useSyncExternalStore } from "react";

/** Tracks viewport width — used to scale the 3D canvas amplitude on mobile. */
export function useIsMobile(breakpoint = 768): boolean {
  return useSyncExternalStore(
    (cb) => subscribe(breakpoint, cb),
    () => getSnapshot(breakpoint),
    () => false
  );
}

function subscribe(breakpoint: number, callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
  mq.addEventListener?.("change", callback);
  return () => mq.removeEventListener?.("change", callback);
}

function getSnapshot(breakpoint: number): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
}
