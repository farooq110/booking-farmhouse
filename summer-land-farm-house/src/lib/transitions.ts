/**
 * src/lib/transitions.ts — SINGLE SOURCE OF TRUTH for View Transitions API.
 * Refs: https://nextjs.org/docs/app/guides/view-transitions
 */
"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function viewTransitionSupported(): boolean {
  if (typeof document === "undefined") return false;
  if (typeof document.startViewTransition !== "function") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

export function withViewTransition<T>(update: () => T): T | Promise<T> {
  if (!viewTransitionSupported()) return update();
  const transition = document.startViewTransition(() => update());
  return transition.finished as Promise<T>;
}

export function useViewTransitionNavigate() {
  const router = useRouter();
  return useCallback((href: string, options?: { transitionTypes?: string[] }) => {
    if (!viewTransitionSupported()) { router.push(href); return; }
    router.push(href, options as Parameters<typeof router.push>[1]);
  }, [router]);
}
