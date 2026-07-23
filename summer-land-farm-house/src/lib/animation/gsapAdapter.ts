/**
 * GSAP adapter — the ONLY file in the app that imports `gsap` directly.
 * Every consumer goes through `getAnimationEngine()` so we can swap GSAP
 * for another engine (e.g. Motion One / WAAPI) by editing this one file.
 */
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { IAnimationEngine, ScrollProgressListener } from "@/types/animation";

let registered = false;
function ensureRegistered() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

class GsapAnimationEngine implements IAnimationEngine {
  constructor() {
    ensureRegistered();
  }

  scrollTrigger(
    target: HTMLElement | string,
    vars: Parameters<IAnimationEngine["scrollTrigger"]>[1]
  ): () => void {
    const triggerEl =
      typeof vars.trigger === "string"
        ? document.querySelector<HTMLElement>(vars.trigger)
        : vars.trigger;

    if (!triggerEl) return () => {};

    const ctx = gsap.context(() => {
      gsap.to(target, {
        ease: "none",
        scrollTrigger: {
          trigger: triggerEl,
          start: vars.start ?? "top bottom",
          end: vars.end ?? "bottom top",
          scrub: vars.scrub ?? true,
          markers: vars.markers ?? false,
          onUpdate: (self) => {
            vars.onUpdate?.({
              progress: self.progress,
              velocity: self.getVelocity(),
            });
          },
        },
      });
    });

    return () => ctx.revert();
  }

  onScrollProgress(
    trigger: HTMLElement,
    listener: ScrollProgressListener
  ): () => void {
    const st = ScrollTrigger.create({
      trigger,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) =>
        listener({ progress: self.progress, velocity: self.getVelocity() }),
    });

    return () => st.kill();
  }

  set(target: HTMLElement | string, props: Record<string, unknown>): void {
    gsap.set(target, props);
  }

  kill(target: HTMLElement | string): void {
    gsap.killTweensOf(target);
  }

  refresh(): void {
    ScrollTrigger.refresh();
  }
}

let engine: IAnimationEngine | null = null;

export function getAnimationEngine(): IAnimationEngine {
  if (typeof window === "undefined") {
    // SSR-safe stub — calls become no-ops on the server
    return {
      scrollTrigger: () => () => {},
      onScrollProgress: () => () => {},
      set: () => {},
      kill: () => {},
      refresh: () => {},
    };
  }
  if (!engine) engine = new GsapAnimationEngine();
  return engine;
}
