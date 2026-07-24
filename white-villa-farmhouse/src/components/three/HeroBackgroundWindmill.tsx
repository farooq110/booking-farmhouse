"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Windmill } from "./Windmill";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * HeroBackgroundWindmill — a SUBTLE 3D windmill that lives behind the hero
 * content only. It does NOT travel across the page. It does NOT obscure
 * content. It slowly spins in place, low opacity, blended into the cover
 * image so the hero feels alive without competing with the headline.
 *
 * Removed from this version (per feedback):
 *  - Fixed full-viewport canvas that "travelled" through every section
 *  - Scroll-driven keyframe journey
 *  - GSAP ScrollTrigger wiring
 *  - Web-worker math
 *  - Mouse parallax
 *  - drei <Environment preset="park" /> — this loaded an external HDR
 *    (rooitou_park_1k.hdr) from the pmndrs/drei-assets CDN on every
 *    page load. Removing it eliminates a network fetch and the
 *    duplicate-fetch seen in the dev-tools Network tab. The scene
 *    keeps its ambient + directional lights, which are more than
 *    enough for a low-opacity background element.
 *
 * Kept:
 *  - Procedural windmill geometry (the Casa De Fazenda theme)
 *  - Continuous blade rotation (signature motion)
 *  - prefers-reduced-motion fallback (gentler spin)
 */
export function HeroBackgroundWindmill() {
  const reduced = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ opacity: 0.42 }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 9], fov: 38 }}
        dpr={[1, 2]}
        style={{ pointerEvents: "none" }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          {/* Warm sky + sun lighting to blend with the cover image */}
          <ambientLight intensity={0.85} color="#f4e8d0" />
          <directionalLight
            position={[4, 5, 4]}
            intensity={1.4}
            color="#fff1d0"
          />
          <directionalLight
            position={[-3, -1, 2]}
            intensity={0.3}
            color="#8a9a78"
          />

          {/* Position the windmill to the far right, well clear of the headline.
              Scaled down + pushed back in Z so it reads as a background element,
              not a foreground object competing with the copy. */}
          <group position={[3.2, -0.8, -1]} scale={0.55}>
            <Windmill
              reduced={reduced}
              spinSpeed={reduced ? 0.2 : 0.5}
            />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
