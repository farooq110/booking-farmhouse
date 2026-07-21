/**
 * Shared animation types — framework-agnostic.
 * Any animation engine (GSAP, Framer Motion, native WAAPI) must conform to these
 * interfaces so we can swap implementations without touching consumers.
 */

export interface ScrollSequenceConfig {
  /** CSS selector or element that defines the scroll track */
  trigger: string | HTMLElement;
  /** "top bottom" | "top center" | "top top" — start position */
  start?: string;
  /** end position */
  end?: string;
  /** scrub: true = tied to scroll, false = play on enter */
  scrub?: boolean | number;
  /** markers for debug (dev only) */
  markers?: boolean;
}

export interface ScrollProgress {
  /** 0 → 1 overall progress through the trigger */
  progress: number;
  /** velocity in px/sec (signed) */
  velocity: number;
}

export type ScrollProgressListener = (p: ScrollProgress) => void;

/**
 * Animation engine abstraction. Wrap GSAP behind this so consumers don't
 * import gsap directly. Tomorrow you can swap GSAP → Motion One or WAAPI
 * without rewriting the call sites.
 */
export interface IAnimationEngine {
  /** Register a scroll-driven tween tied to a trigger element */
  scrollTrigger(
    target: HTMLElement | string,
    vars: ScrollSequenceConfig & {
      onUpdate?: (self: { progress: number; velocity: number }) => void;
    }
  ): () => void; // returns a cleanup fn

  /** Subscribe to raw scroll progress for an element */
  onScrollProgress(
    trigger: HTMLElement,
    listener: ScrollProgressListener
  ): () => void;

  /** Set a property immediately (no animation) */
  set(target: HTMLElement | string, props: Record<string, unknown>): void;

  /** Kill all animations on target */
  kill(target: HTMLElement | string): void;

  /** Refresh all scroll triggers (after layout changes) */
  refresh(): void;
}

export interface ReducedMotionState {
  /** User prefers reduced motion */
  prefersReduced: boolean;
}

export type MotionStrategy = "full" | "reduced";
