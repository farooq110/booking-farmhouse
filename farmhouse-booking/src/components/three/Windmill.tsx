"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildWindmill, type WindmillBuildResult } from "@/lib/three/windmillGeometry";
import { useFrame } from "@react-three/fiber";

interface WindmillProps {
  /** Continuous spin speed of the blades in radians per second */
  spinSpeed?: number;
  /** Reduced motion: spin slower */
  reduced?: boolean;
}

/**
 * Procedural Farmhouse Windmill — hero background decoration.
 *
 * The blades spin continuously around the hub (the signature motion).
 * That's it — no scroll-jacking, no traveling, no parallax. Just a
 * slowly spinning windmill that lives in the hero background.
 *
 * Implementation note: the blades group is found at runtime by scanning
 * the windmill.group's children for the sub-group that contains the
 * lattice sail meshes. This avoids needing to thread a ref through the
 * primitive's children manually.
 */
export function Windmill({ spinSpeed = 0.5, reduced = false }: WindmillProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bladesRef = useRef<THREE.Group>(null);

  // Build the windmill geometry once
  const windmill = useMemo<WindmillBuildResult>(() => buildWindmill(), []);

  useEffect(() => {
    return () => windmill.dispose();
  }, [windmill]);

  useFrame((_, delta) => {
    const b = bladesRef.current;
    if (!b) return;

    // Blades always spin — this is the signature continuous rotation
    b.rotation.z += spinSpeed * delta;

    // Reduced motion: also dampen the windmill's vertical bob (handled by
    // parent Float in the scene, not here)
    if (reduced) {
      // No additional animation in reduced mode
      return;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={windmill.group}
        ref={(node: THREE.Group | null) => {
          if (node) {
            // Find the blades child group (it's the one with > 3 children —
            // the spar, sail, and 5 cross-pieces)
            const bladesChild = node.children.find(
              (c) => c.type === "Group" && c.children.length > 3
            );
            if (bladesChild) bladesRef.current = bladesChild as THREE.Group;
          }
        }}
      />
    </group>
  );
}
