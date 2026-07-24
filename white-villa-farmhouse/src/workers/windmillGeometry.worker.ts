/**
 * windmillGeometry.worker.ts — builds windmill geometry off the main thread.
 * Worker runs buildWindmillData() (pure math, no Three.js) and posts back
 * the result with Transferable typed-array buffers (zero copy).
 */
/// <reference lib="webworker" />
import { buildWindmillData, type SerializedWindmill } from "@/lib/three/windmillGeometry";

export interface WindmillBuildRequest { type: "build"; }
export interface WindmillBuiltMessage {
  type: "built";
  ok: boolean;
  data?: SerializedWindmill;
  error?: string;
  durationMs?: number;
}

self.onmessage = (e: MessageEvent<WindmillBuildRequest>) => {
  const msg = e.data;
  if (!msg || msg.type !== "build") return;
  try {
    const t0 = performance.now();
    const data = buildWindmillData();
    const t1 = performance.now();
    const transferList: ArrayBuffer[] = [];
    for (const mesh of data.meshes) {
      transferList.push(mesh.positions.buffer as ArrayBuffer);
      if (mesh.normals) transferList.push(mesh.normals.buffer as ArrayBuffer);
      if (mesh.uvs) transferList.push(mesh.uvs.buffer as ArrayBuffer);
      if (mesh.indices) transferList.push(mesh.indices.buffer as ArrayBuffer);
    }
    const res: WindmillBuiltMessage = { type: "built", ok: true, data, durationMs: t1 - t0 };
    // eslint-disable-next-line no-console
    console.debug(`[windmill.worker] built ${data.meshes.length} meshes in ${(t1 - t0).toFixed(1)}ms (transferring ${transferList.length} buffers)`);
    (self as unknown as Worker).postMessage(res, transferList);
  } catch (err) {
    const res: WindmillBuiltMessage = { type: "built", ok: false, error: err instanceof Error ? err.message : String(err) };
    (self as unknown as Worker).postMessage(res);
  }
};
