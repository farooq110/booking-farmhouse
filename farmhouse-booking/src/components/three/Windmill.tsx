"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useWindmillWorker } from "@/lib/three/windmillGeometryClient";

interface WindmillProps {
  /** Continuous spin speed of the blades in radians per second */
  spinSpeed?: number;
  /** Reduced motion: spin slower */
  reduced?: boolean;
}

/**
 * Procedural Farmhouse Windmill — hero background decoration.
 *
 * HEAVY WORK OFFLOADED:
 *   The windmill geometry is built in a Web Worker
 *   (src/workers/windmillGeometry.worker.ts) using buildWindmillData()
 *   — pure math, no Three.js objects. The worker posts back the
 *   serialized vertex/index arrays (Transferable typed arrays — zero
 *   copy) and the main thread reconstructs THREE.BufferGeometry +
 *   Material + Mesh via buildWindmillFromData().
 *
 *   This means the main thread never runs the heavy geometry math; only
 *   the cheap Three.js object instantiation.
 *
 *   If the worker is unavailable (SSR, old browser), the hook falls
 *   back to running buildWindmill() synchronously on the main thread.
 */
export function Windmill({ spinSpeed = 0.5, reduced = false }: WindmillProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bladesRef = useRef<THREE.Group>(null);

  const { result, status } = useWindmillWorker();

  useEffect(() => {
    if (result?.blades) {
      bladesRef.current = result.blades;
    }
    return () => {
      result?.dispose();
    };
  }, [result]);

  useFrame((_, delta) => {
    const b = bladesRef.current;
    if (!b) return;
    b.rotation.z += spinSpeed * delta;
    if (reduced) return;
  });

  if (status !== "ready" || !result) return null;

  return (
    <group ref={groupRef}>
      <primitive object={result.group} />
    </group>
  );
}
