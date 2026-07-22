"use client";
/**
 * useWindmillWorker — owns a Web Worker that builds the windmill geometry
 * off the main thread. Falls back to synchronous buildWindmill() if worker
 * is unavailable.
 */
import { useEffect, useState } from "react";
import {
  buildWindmill,
  buildWindmillFromData,
  type WindmillBuildResult,
  type SerializedWindmill,
} from "@/lib/three/windmillGeometry";
import type { WindmillBuiltMessage } from "@/workers/windmillGeometry.worker";

export type WorkerStatus = "idle" | "building" | "ready" | "error";

export interface UseWindmillWorkerResult {
  status: WorkerStatus;
  data?: SerializedWindmill;
  result: WindmillBuildResult | null;
  error?: string;
}

export function useWindmillWorker(): UseWindmillWorkerResult {
  const [status, setStatus] = useState<WorkerStatus>("idle");
  const [data, setData] = useState<SerializedWindmill | undefined>(undefined);
  const [result, setResult] = useState<WindmillBuildResult | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let worker: Worker | null = null;
    try {
      worker = new Worker(
        new URL("../../workers/windmillGeometry.worker.ts", import.meta.url),
        { type: "module" }
      );
    } catch {
      try {
        const fallback = buildWindmill();
        setResult(fallback);
        setStatus("ready");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : String(err));
      }
      return;
    }
    setStatus("building");
    worker.onmessage = (e: MessageEvent<WindmillBuiltMessage>) => {
      const msg = e.data;
      if (msg?.type !== "built") return;
      if (msg.ok && msg.data) {
        try {
          const built = buildWindmillFromData(msg.data);
          setData(msg.data);
          setResult(built);
          setStatus("ready");
        } catch (err) {
          setStatus("error");
          setError(err instanceof Error ? err.message : String(err));
        }
      } else {
        setStatus("error");
        setError(msg.error ?? "unknown worker error");
      }
    };
    worker.onerror = (ev) => {
      setStatus("error");
      setError(ev.message || "worker crashed");
    };
    worker.postMessage({ type: "build" });
    return () => { worker?.terminate(); };
  }, []);

  return { status, data, result, error };
}
