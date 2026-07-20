/**
 * Procedural Farmhouse Windmill geometry — built entirely from math.
 *
 * A classic Dutch-style windmill: a tapered stone tower with a cap,
 * four rotating blades with lattice sails, and a small door + windows.
 *
 * No external .glb / .obj files. Output is a THREE.Group of meshes.
 *
 * The blades live on a separate child group so they can spin
 * independently of the tower (continuous rotation, per spec).
 */
import * as THREE from "three";

/** Build a tapered cylinder section between two radii. */
function taperedCylinder(
  rTop: number,
  rBottom: number,
  height: number,
  segments = 24
): THREE.BufferGeometry {
  const geom = new THREE.CylinderGeometry(rTop, rBottom, height, segments, 1, false);
  return geom;
}

/** Build a single windmill blade (a lattice sail). */
function buildBlade(length: number, width: number): THREE.Group {
  const group = new THREE.Group();

  // Main spar — runs from hub to tip
  const sparGeom = new THREE.BoxGeometry(0.08, length, 0.08);
  const sparMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#6b5536"),
    roughness: 0.85,
    metalness: 0.05,
  });
  const spar = new THREE.Mesh(sparGeom, sparMat);
  spar.position.y = length / 2;
  group.add(spar);

  // Sail cloth — a tapered panel on one side of the spar
  const sailShape = new THREE.Shape();
  sailShape.moveTo(0, 0);
  sailShape.lineTo(width, 0.05);
  sailShape.lineTo(width * 0.85, length - 0.1);
  sailShape.lineTo(0, length);
  sailShape.closePath();
  const sailGeom = new THREE.ShapeGeometry(sailShape, 16);
  const sailMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#f0e4c8"),
    roughness: 0.7,
    metalness: 0.0,
    side: THREE.DoubleSide,
    emissive: new THREE.Color("#a08858"),
    emissiveIntensity: 0.05,
  });
  const sail = new THREE.Mesh(sailGeom, sailMat);
  sail.position.set(0.04, 0, 0.02);
  group.add(sail);

  // Cross-pieces — lattice effect, 5 evenly spaced
  const crossMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#5a4528"),
    roughness: 0.85,
  });
  for (let i = 1; i <= 5; i++) {
    const t = (i / 6) * length;
    const wAtT = width * (1 - t / length * 0.15);
    const crossGeom = new THREE.BoxGeometry(wAtT, 0.05, 0.04);
    const cross = new THREE.Mesh(crossGeom, crossMat);
    cross.position.set(wAtT / 2, t, 0);
    group.add(cross);
  }

  return group;
}

/** Build the windmill cap (roof). */
function buildCap(radius: number): THREE.BufferGeometry {
  return new THREE.ConeGeometry(radius, radius * 0.8, 16);
}

export interface WindmillBuildResult {
  /** The full windmill group — tower + cap + blades assembly */
  group: THREE.Group;
  /** The blades-only group — rotate this for continuous spin */
  blades: THREE.Group;
  /** Dispose helper */
  dispose: () => void;
}

export function buildWindmill(): WindmillBuildResult {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  // ── Tower: tapered stone body in 3 stacked sections ──
  const stoneMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#b8a886"),
    roughness: 0.95,
    metalness: 0.0,
  });
  disposables.push(stoneMat);

  const baseGeom = taperedCylinder(0.85, 1.05, 0.8, 24);
  const midGeom = taperedCylinder(0.7, 0.85, 1.0, 24);
  const topGeom = taperedCylinder(0.6, 0.7, 0.9, 24);
  disposables.push(baseGeom, midGeom, topGeom);

  const base = new THREE.Mesh(baseGeom, stoneMat);
  base.position.y = 0.4;
  group.add(base);

  const mid = new THREE.Mesh(midGeom, stoneMat);
  mid.position.y = 1.3;
  group.add(mid);

  const top = new THREE.Mesh(topGeom, stoneMat);
  top.position.y = 2.25;
  group.add(top);

  // ── Cap (cone roof) ──
  const capGeom = buildCap(0.7);
  const capMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#5a3a22"),
    roughness: 0.7,
    metalness: 0.1,
  });
  disposables.push(capGeom, capMat);
  const cap = new THREE.Mesh(capGeom, capMat);
  cap.position.y = 3.05;
  group.add(cap);

  // ── Door ──
  const doorGeom = new THREE.BoxGeometry(0.3, 0.55, 0.05);
  const doorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#4a2e18"),
    roughness: 0.8,
  });
  disposables.push(doorGeom, doorMat);
  const door = new THREE.Mesh(doorGeom, doorMat);
  door.position.set(0, 0.3, 1.0);
  group.add(door);

  // ── Windows (two small round windows on the mid section) ──
  const winGeom = new THREE.CircleGeometry(0.12, 16);
  const winMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#3a5840"),
    roughness: 0.4,
    metalness: 0.3,
    emissive: new THREE.Color("#8aa880"),
    emissiveIntensity: 0.3,
  });
  disposables.push(winGeom, winMat);
  for (const angle of [Math.PI * 0.25, Math.PI * 0.75]) {
    const win = new THREE.Mesh(winGeom, winMat);
    win.position.set(
      Math.cos(angle) * 0.83,
      1.3,
      Math.sin(angle) * 0.83
    );
    win.lookAt(0, 1.3, 0);
    group.add(win);
  }

  // ── Hub ──
  const hubGeom = new THREE.SphereGeometry(0.18, 16, 16);
  const hubMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#3a2a18"),
    roughness: 0.6,
    metalness: 0.2,
  });
  disposables.push(hubGeom, hubMat);
  const hub = new THREE.Mesh(hubGeom, hubMat);
  hub.position.set(0, 2.55, 0.7);
  group.add(hub);

  // ── Blades assembly (4 blades at 90°, on a child group that spins) ──
  const blades = new THREE.Group();
  blades.position.set(0, 2.55, 0.78);

  const bladeLength = 2.4;
  const bladeWidth = 0.55;
  for (let i = 0; i < 4; i++) {
    const blade = buildBlade(bladeLength, bladeWidth);
    blade.rotation.z = (i * Math.PI) / 2;
    blades.add(blade);
  }
  group.add(blades);

  // Center the whole assembly vertically — origin at windmill center
  group.position.y = -1.0;

  // Slight overall scale to fit nicely in the camera frame
  group.scale.setScalar(0.85);

  return {
    group,
    blades,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}
