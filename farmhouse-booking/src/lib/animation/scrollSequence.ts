/**
 * Declarative scroll journey for the signature 3D Farmhouse Windmill.
 *
 * Each entry defines where the windmill should float to as the user scrolls
 * through a section, plus a "dip" amplitude (the soft bounce near the
 * top of each new section). Adding a new section = adding one entry here.
 *
 * Note: the windmill is taller than the original leaf, so y-amplitudes are
 * slightly smaller to avoid overlapping section headings.
 */

export interface SceneKeyframe {
  sectionId: string;
  x: number;
  y: number;
  z: number;
  dip: number;
  rotationOffset: number;
  scale: number;
}

export const SCENE_KEYFRAMES: SceneKeyframe[] = [
  // Hero — windmill floats to the right of the headline
  { sectionId: "hero", x: 0.22, y: 0.02, z: 0, dip: 0.03, rotationOffset: 0, scale: 1 },
  // Estate — drifts left as the 3 facility cards appear on the right
  { sectionId: "estate", x: -0.24, y: -0.04, z: 0.5, dip: 0.05, rotationOffset: Math.PI * 0.25, scale: 0.78 },
  // Experience — moves center-top, smaller, behind the numbered steps
  { sectionId: "experience", x: 0, y: 0.10, z: -0.5, dip: 0.04, rotationOffset: Math.PI * 0.5, scale: 0.7 },
  // Gallery — drifts right again, larger, behind the immersive carousel
  { sectionId: "gallery", x: 0.27, y: -0.05, z: 0.3, dip: 0.06, rotationOffset: Math.PI * 0.75, scale: 0.9 },
  // Location — subtle, top-left, as the map dominates
  { sectionId: "location", x: -0.28, y: 0.08, z: -0.2, dip: 0.04, rotationOffset: Math.PI, scale: 0.65 },
  // Final CTA — settles dead-center as the gates open
  { sectionId: "final-cta", x: 0, y: 0, z: 1.5, dip: 0.02, rotationOffset: Math.PI * 1.25, scale: 1.1 },
];

/** Reduced-motion placement — a single static, gently spinning position */
export const REDUCED_MOTION_PLACEMENT = {
  x: 0,
  y: 0,
  z: 0,
  scale: 0.85,
} as const;
