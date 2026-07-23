/**
 * Web worker — offloads per-frame scroll math from the main thread.
 *
 * Receives raw { progress, velocity, sectionIndex } and returns
 * interpolated position { x, y, z, rotation, scale } with the dip
 * bounce easing applied. The main thread just feeds the result into
 * the Three.js mesh — no math on the render loop.
 */

export interface ScrollMathRequest {
  type: "compute";
  /** 0..1 progress through the active section */
  sectionProgress: number;
  /** absolute scroll velocity in px/sec (signed) */
  velocity: number;
  /** index of the current keyframe in the journey */
  current: number;
  /** index of the next keyframe */
  next: number;
  /** 0..1 blended progress between current and next (already computed by adapter) */
  blend: number;
  /** reduced motion flag */
  reduced: boolean;
}

export interface ScrollMathResponse {
  type: "computed";
  x: number;
  y: number;
  z: number;
  rotationOffset: number;
  scale: number;
  /** dip — a soft vertical bounce that peaks near section entry */
  dipOffset: number;
  /** velocity-driven tilt of the leaf */
  tilt: number;
}

/** Smooth easing for the dip — peaks at section entry, fades out by 30% in. */
function dipEase(t: number): number {
  // Bell-ish curve peaking near t=0.1
  if (t > 0.35) return 0;
  const x = (t - 0.1) / 0.18;
  return Math.exp(-x * x);
}

/** Map velocity → tilt angle in radians. Saturates around ±0.25 rad. */
function velocityTilt(v: number): number {
  const clamped = Math.max(-1500, Math.min(1500, v));
  return (clamped / 1500) * 0.25;
}

self.onmessage = (e: MessageEvent<ScrollMathRequest>) => {
  const msg = e.data;
  if (msg.type !== "compute") return;

  if (msg.reduced) {
    const res: ScrollMathResponse = {
      type: "computed",
      x: 0, y: 0, z: 0,
      rotationOffset: 0,
      scale: 0.85,
      dipOffset: 0,
      tilt: 0,
    };
    (self as unknown as Worker).postMessage(res);
    return;
  }

  // Pull the worker-side mirror of SCENE_KEYFRAMES.
  // (Workers can't import app modules; we inline a minimal copy. The adapter
  // sends `current`/`next` so we only need positions for those two.)
  // The actual keyframes live in scrollSequence.ts; the adapter passes the
  // values it needs via the message — so we just need a generic interpolator.
  //
  // The adapter passes raw numbers via the message body — but to keep this
  // worker self-contained we instead expect it to also pass the keyframe data
  // it needs. See scrollMathClient.ts for the matching postMessage call.

  // NOTE: The actual keyframe interpolation uses values that the adapter
  // attaches to the message under `_kf_current` / `_kf_next`. They are
  // intentionally typed as `any` here to keep the public interface clean.
  const reqAny = msg as ScrollMathRequest & {
    _kfCurrent?: { x: number; y: number; z: number; dip: number; rotationOffset: number; scale: number };
    _kfNext?: { x: number; y: number; z: number; dip: number; rotationOffset: number; scale: number };
  };

  const a = reqAny._kfCurrent;
  if (!a) return;
  const b = reqAny._kfNext ?? a;

  const t = msg.blend;
  const lerp = (x: number, y: number) => x + (y - x) * t;

  const dipAmount = lerp(a.dip, b.dip);
  const dipOffset = dipEase(msg.sectionProgress) * dipAmount;

  const res: ScrollMathResponse = {
    type: "computed",
    x: lerp(a.x, b.x),
    y: lerp(a.y, b.y) - dipOffset,
    z: lerp(a.z, b.z),
    rotationOffset: lerp(a.rotationOffset, b.rotationOffset),
    scale: lerp(a.scale, b.scale),
    dipOffset,
    tilt: velocityTilt(msg.velocity),
  };

  (self as unknown as Worker).postMessage(res);
};
