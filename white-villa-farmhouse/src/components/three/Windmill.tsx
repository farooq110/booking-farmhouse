"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useWindmillWorker } from "@/lib/three/windmillGeometryClient";

interface WindmillProps {
  spinSpeed?: number;
  reduced?: boolean;
}

export function Windmill({ spinSpeed = 0.5, reduced = false }: WindmillProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bladesRef = useRef<THREE.Group>(null);
  const { result, status } = useWindmillWorker();

  useEffect(() => {
    if (result?.blades) {
      bladesRef.current = result.blades;
    }
    return () => { result?.dispose(); };
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
