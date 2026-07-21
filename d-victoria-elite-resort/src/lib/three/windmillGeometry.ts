/**
 * src/lib/three/windmillGeometry.ts — procedural windmill geometry.
 *
 * Two-stage build so the heavy math runs in a Web Worker:
 *   1. buildWindmillData() — pure data: typed arrays + material params +
 *      transforms + hierarchy. NO Three.js objects. Worker runs this.
 *   2. buildWindmillFromData(data) — instantiates THREE.BufferGeometry +
 *      Material + Mesh from the data. Fast (no math, just GPU upload).
 *      Main thread runs this when the worker posts back the data.
 *   3. buildWindmill() — convenience: both stages on main thread (fallback).
 */
import * as THREE from "three";

export interface SerializedMaterial {
  colorHex: string;
  roughness: number;
  metalness: number;
  side?: "front" | "back" | "double";
  emissiveHex?: string;
  emissiveIntensity?: number;
}

export interface SerializedMesh {
  positions: Float32Array;
  normals: Float32Array | null;
  uvs: Float32Array | null;
  indices: Uint32Array | null;
  material: SerializedMaterial;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parentIndex: number;
  isBlades?: boolean;
}

export interface SerializedWindmill {
  meshes: SerializedMesh[];
  bladesIndex: number;
}

export interface WindmillBuildResult {
  group: THREE.Group;
  blades: THREE.Group;
  dispose: () => void;
}

// ─── Stage 1 — pure-math primitive builders ────────────────────────────

function taperedCylinderData(rTop: number, rBottom: number, height: number, segments = 24) {
  const ringCount = 2;
  const vertsPerRing = segments + 1;
  const totalVerts = ringCount * vertsPerRing;
  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const halfH = height / 2;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const slopeY = (rBottom - rTop) / height;
    const nLen = Math.sqrt(cosT * cosT + slopeY * slopeY + sinT * sinT);
    const nx = cosT / nLen, ny = slopeY / nLen, nz = sinT / nLen;
    const topIdx = i * 3;
    positions[topIdx] = rTop * cosT;
    positions[topIdx + 1] = halfH;
    positions[topIdx + 2] = rTop * sinT;
    normals[topIdx] = nx; normals[topIdx + 1] = ny; normals[topIdx + 2] = nz;
    const botIdx = (vertsPerRing + i) * 3;
    positions[botIdx] = rBottom * cosT;
    positions[botIdx + 1] = -halfH;
    positions[botIdx + 2] = rBottom * sinT;
    normals[botIdx] = nx; normals[botIdx + 1] = ny; normals[botIdx + 2] = nz;
  }
  const indices = new Uint32Array(segments * 6);
  for (let i = 0; i < segments; i++) {
    const a = i, b = i + 1, c = vertsPerRing + i, d = vertsPerRing + i + 1;
    const off = i * 6;
    indices[off] = a; indices[off + 1] = c; indices[off + 2] = b;
    indices[off + 3] = b; indices[off + 4] = c; indices[off + 5] = d;
  }
  return { positions, normals, indices };
}

function boxData(w: number, h: number, d: number) {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const positions = new Float32Array([
    hw, -hh, -hd,  hw, hh, -hd,  hw, hh, hd,  hw, -hh, hd,
    -hw, -hh, hd,  -hw, hh, hd,  -hw, hh, -hd,  -hw, -hh, -hd,
    -hw, hh, hd,   hw, hh, hd,   hw, hh, -hd,   -hw, hh, -hd,
    -hw, -hh, -hd, hw, -hh, -hd, hw, -hh, hd,   -hw, -hh, hd,
    -hw, -hh, hd,  hw, -hh, hd,  hw, hh, hd,    -hw, hh, hd,
    hw, -hh, -hd,  -hw, -hh, -hd, -hw, hh, -hd, hw, hh, -hd,
  ]);
  const normals = new Float32Array([
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    -1,0,0, -1,0,0, -1,0,0, -1,0,0,
    0,1,0, 0,1,0, 0,1,0, 0,1,0,
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
  ]);
  const indices = new Uint32Array([
    0,1,2, 0,2,3,    4,5,6, 4,6,7,
    8,9,10, 8,10,11,  12,13,14, 12,14,15,
    16,17,18, 16,18,19, 20,21,22, 20,22,23,
  ]);
  return { positions, normals, indices };
}

function coneData(radius: number, height: number, segments = 16) {
  const halfH = height / 2;
  const totalVerts = 1 + (segments + 1);
  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  positions[0] = 0; positions[1] = halfH; positions[2] = 0;
  normals[0] = 0; normals[1] = 1; normals[2] = 0;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const idx = (1 + i) * 3;
    positions[idx] = radius * cosT;
    positions[idx + 1] = -halfH;
    positions[idx + 2] = radius * sinT;
    const slopeY = radius / height;
    const nLen = Math.sqrt(cosT * cosT + slopeY * slopeY + sinT * sinT);
    normals[idx] = cosT / nLen; normals[idx + 1] = slopeY / nLen; normals[idx + 2] = sinT / nLen;
  }
  const indices = new Uint32Array(segments * 3);
  for (let i = 0; i < segments; i++) {
    indices[i * 3] = 0;
    indices[i * 3 + 1] = 1 + i;
    indices[i * 3 + 2] = 1 + ((i + 1) % (segments + 1));
  }
  return { positions, normals, indices };
}

function sphereData(radius: number, wSegs = 16, hSegs = 16) {
  const totalVerts = (wSegs + 1) * (hSegs + 1);
  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  for (let y = 0; y <= hSegs; y++) {
    const v = y / hSegs;
    const phi = v * Math.PI;
    for (let x = 0; x <= wSegs; x++) {
      const u = x / wSegs;
      const theta = u * Math.PI * 2;
      const idx = (y * (wSegs + 1) + x) * 3;
      const px = -radius * Math.cos(theta) * Math.sin(phi);
      const py = radius * Math.cos(phi);
      const pz = radius * Math.sin(theta) * Math.sin(phi);
      positions[idx] = px; positions[idx + 1] = py; positions[idx + 2] = pz;
      normals[idx] = px / radius; normals[idx + 1] = py / radius; normals[idx + 2] = pz / radius;
    }
  }
  const indices = new Uint32Array(wSegs * hSegs * 6);
  let off = 0;
  for (let y = 0; y < hSegs; y++) {
    for (let x = 0; x < wSegs; x++) {
      const a = y * (wSegs + 1) + x;
      const b = a + 1;
      const c = a + (wSegs + 1);
      const d = c + 1;
      indices[off++] = a; indices[off++] = c; indices[off++] = b;
      indices[off++] = b; indices[off++] = c; indices[off++] = d;
    }
  }
  return { positions, normals, indices };
}

function circleData(radius: number, segments = 16) {
  const totalVerts = 1 + segments;
  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  positions[0] = 0; positions[1] = 0; positions[2] = 0;
  normals[0] = 0; normals[1] = 0; normals[2] = 1;
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const idx = (1 + i) * 3;
    positions[idx] = radius * Math.cos(theta);
    positions[idx + 1] = radius * Math.sin(theta);
    positions[idx + 2] = 0;
    normals[idx] = 0; normals[idx + 1] = 0; normals[idx + 2] = 1;
  }
  const indices = new Uint32Array(segments * 3);
  for (let i = 0; i < segments; i++) {
    indices[i * 3] = 0;
    indices[i * 3 + 1] = 1 + i;
    indices[i * 3 + 2] = 1 + ((i + 1) % segments);
  }
  return { positions, normals, indices };
}

function sailShapeData(length: number, width: number) {
  const positions = new Float32Array([
    0, 0, 0,
    width, 0.05, 0,
    width * 0.85, length - 0.1, 0,
    0, length, 0,
  ]);
  const normals = new Float32Array([0,0,1, 0,0,1, 0,0,1, 0,0,1]);
  const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
  return { positions, normals, indices };
}

const MATERIALS = {
  stone: { colorHex: "#b8a886", roughness: 0.95, metalness: 0.0 },
  cap: { colorHex: "#5a3a22", roughness: 0.7, metalness: 0.1 },
  door: { colorHex: "#4a2e18", roughness: 0.8, metalness: 0.0 },
  window: { colorHex: "#3a5840", roughness: 0.4, metalness: 0.3, emissiveHex: "#8aa880", emissiveIntensity: 0.3 },
  hub: { colorHex: "#3a2a18", roughness: 0.6, metalness: 0.2 },
  spar: { colorHex: "#6b5536", roughness: 0.85, metalness: 0.05 },
  sail: { colorHex: "#f0e4c8", roughness: 0.7, metalness: 0.0, side: "double" as const, emissiveHex: "#a08858", emissiveIntensity: 0.05 },
  cross: { colorHex: "#5a4528", roughness: 0.85, metalness: 0.0 },
};

export function buildWindmillData(): SerializedWindmill {
  const meshes: SerializedMesh[] = [];
  let bladesIndex = -1;

  const base = taperedCylinderData(0.85, 1.05, 0.8, 24);
  meshes.push({ ...base, uvs: null, material: MATERIALS.stone, position: [0, 0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], parentIndex: -1 });
  const mid = taperedCylinderData(0.7, 0.85, 1.0, 24);
  meshes.push({ ...mid, uvs: null, material: MATERIALS.stone, position: [0, 1.3, 0], rotation: [0, 0, 0], scale: [1, 1, 1], parentIndex: -1 });
  const top = taperedCylinderData(0.6, 0.7, 0.9, 24);
  meshes.push({ ...top, uvs: null, material: MATERIALS.stone, position: [0, 2.25, 0], rotation: [0, 0, 0], scale: [1, 1, 1], parentIndex: -1 });
  const cap = coneData(0.7, 0.7 * 0.8, 16);
  meshes.push({ ...cap, uvs: null, material: MATERIALS.cap, position: [0, 3.05, 0], rotation: [0, 0, 0], scale: [1, 1, 1], parentIndex: -1 });
  const door = boxData(0.3, 0.55, 0.05);
  meshes.push({ ...door, uvs: null, material: MATERIALS.door, position: [0, 0.3, 1.0], rotation: [0, 0, 0], scale: [1, 1, 1], parentIndex: -1 });
  const win = circleData(0.12, 16);
  const w1Angle = Math.PI * 0.25;
  meshes.push({ ...win, uvs: null, material: MATERIALS.window, position: [Math.cos(w1Angle) * 0.83, 1.3, Math.sin(w1Angle) * 0.83], rotation: [0, Math.PI + w1Angle, 0], scale: [1, 1, 1], parentIndex: -1 });
  const w2Angle = Math.PI * 0.75;
  meshes.push({ ...win, uvs: null, material: MATERIALS.window, position: [Math.cos(w2Angle) * 0.83, 1.3, Math.sin(w2Angle) * 0.83], rotation: [0, Math.PI + w2Angle, 0], scale: [1, 1, 1], parentIndex: -1 });
  const hub = sphereData(0.18, 16, 16);
  meshes.push({ ...hub, uvs: null, material: MATERIALS.hub, position: [0, 2.55, 0.7], rotation: [0, 0, 0], scale: [1, 1, 1], parentIndex: -1 });

  const degenerate = {
    positions: new Float32Array([0, 0, 0]),
    normals: new Float32Array([0, 1, 0]),
    indices: new Uint32Array([0]),
  };
  meshes.push({ ...degenerate, uvs: null, material: { colorHex: "#000000", roughness: 1, metalness: 0 }, position: [0, 2.55, 0.78], rotation: [0, 0, 0], scale: [1, 1, 1], parentIndex: -1, isBlades: true });
  bladesIndex = meshes.length - 1;

  const bladeLength = 2.4;
  const bladeWidth = 0.55;
  for (let i = 0; i < 4; i++) {
    const bladeRotation = (i * Math.PI) / 2;
    const spar = boxData(0.08, bladeLength, 0.08);
    meshes.push({ ...spar, uvs: null, material: MATERIALS.spar, position: [0, bladeLength / 2, 0], rotation: [0, 0, bladeRotation], scale: [1, 1, 1], parentIndex: bladesIndex });
    const sail = sailShapeData(bladeLength, bladeWidth);
    meshes.push({ ...sail, uvs: null, material: MATERIALS.sail, position: [0.04, 0, 0.02], rotation: [0, 0, bladeRotation], scale: [1, 1, 1], parentIndex: bladesIndex });
    for (let j = 1; j <= 5; j++) {
      const t = (j / 6) * bladeLength;
      const wAtT = bladeWidth * (1 - (t / bladeLength) * 0.15);
      const cross = boxData(wAtT, 0.05, 0.04);
      meshes.push({ ...cross, uvs: null, material: MATERIALS.cross, position: [wAtT / 2, t, 0], rotation: [0, 0, bladeRotation], scale: [1, 1, 1], parentIndex: bladesIndex });
    }
  }
  return { meshes, bladesIndex };
}

export function buildWindmillFromData(data: SerializedWindmill): WindmillBuildResult {
  const disposables: Array<{ dispose: () => void }> = [];
  const meshNodes: THREE.Object3D[] = [];
  const group = new THREE.Group();
  let blades: THREE.Group = new THREE.Group();
  const materialCache = new Map<string, THREE.Material>();

  function getMaterial(spec: SerializedMaterial): THREE.Material {
    const key = `${spec.colorHex}|${spec.roughness}|${spec.metalness}|${spec.emissiveHex ?? ""}|${spec.emissiveIntensity ?? 0}|${spec.side ?? ""}`;
    const cached = materialCache.get(key);
    if (cached) return cached;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.colorHex),
      roughness: spec.roughness,
      metalness: spec.metalness,
      side: spec.side === "double" ? THREE.DoubleSide : spec.side === "back" ? THREE.BackSide : THREE.FrontSide,
      emissive: spec.emissiveHex ? new THREE.Color(spec.emissiveHex) : undefined,
      emissiveIntensity: spec.emissiveIntensity ?? 0,
    });
    disposables.push(mat);
    materialCache.set(key, mat);
    return mat;
  }

  for (const mesh of data.meshes) {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(mesh.positions, 3));
    if (mesh.normals) {
      geom.setAttribute("normal", new THREE.BufferAttribute(mesh.normals, 3));
    } else {
      geom.computeVertexNormals();
    }
    if (mesh.indices) {
      geom.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
    }
    geom.computeBoundingSphere();
    disposables.push(geom);
    const mat = getMaterial(mesh.material);
    const threeMesh = new THREE.Mesh(geom, mat);
    threeMesh.position.set(...mesh.position);
    threeMesh.rotation.set(...mesh.rotation);
    threeMesh.scale.set(...mesh.scale);
    meshNodes.push(threeMesh);
  }

  const bladesNode = meshNodes[data.bladesIndex];
  if (bladesNode && (data.meshes[data.bladesIndex].isBlades ?? false)) {
    const bladesGroup = new THREE.Group();
    bladesGroup.position.copy(bladesNode.position);
    bladesGroup.rotation.copy(bladesNode.rotation);
    bladesGroup.scale.copy(bladesNode.scale);
    meshNodes[data.bladesIndex] = bladesGroup;
    blades = bladesGroup;
  }

  for (let i = 0; i < meshNodes.length; i++) {
    const node = meshNodes[i];
    const parentIdx = data.meshes[i].parentIndex;
    if (parentIdx === -1) {
      group.add(node);
    } else {
      meshNodes[parentIdx].add(node);
    }
  }

  group.position.y = -1.0;
  group.scale.setScalar(0.85);

  return { group, blades, dispose: () => disposables.forEach((d) => d.dispose()) };
}

export function buildWindmill(): WindmillBuildResult {
  return buildWindmillFromData(buildWindmillData());
}
