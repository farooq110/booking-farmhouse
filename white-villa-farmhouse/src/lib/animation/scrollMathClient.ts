"use client";
import { useEffect, useRef } from "react";
import type { SceneKeyframe } from "@/lib/animation/scrollSequence";
import type { ScrollMathRequest, ScrollMathResponse } from "@/workers/scrollMath.worker";

export interface ScrollMathInput {
  sectionProgress: number;
  velocity: number;
  current: number;
  next: number;
  blend: number;
  reduced: boolean;
  kfCurrent: SceneKeyframe;
  kfNext: SceneKeyframe;
}

export type ScrollMathHandler = (r: ScrollMathResponse) => void;

/**
 * useScrollMathWorker — owns a single web worker for the lifetime of the
 * 3D scene, posts computation requests, and invokes `handler` on each
 * computed frame. Falls back to inline computation if workers are
 * unavailable (SSR, very old browsers, security-restricted environments).
 */
export function useScrollMathWorker(handler: ScrollMathHandler) {
  const workerRef = useRef<Worker | null>(null);
  const handlerRef = useRef(handler);

  // Sync the handler ref inside an effect, never during render.
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let worker: Worker | null = null;
    try {
      worker = new Worker(
        new URL("../../workers/scrollMath.worker.ts", import.meta.url),
        { type: "module" }
      );
    } catch {
      worker = null; // fallback path below
    }

    if (worker) {
      worker.onmessage = (e: MessageEvent<ScrollMathResponse>) => {
        if (e.data.type === "computed") handlerRef.current(e.data);
      };
      workerRef.current = worker;
    }

    return () => {
      worker?.terminate();
      workerRef.current = null;
    };
  }, []);

  const post = (input: ScrollMathInput) => {
    const payload: ScrollMathRequest & {
      _kfCurrent: SceneKeyframe;
      _kfNext: SceneKeyframe;
    } = {
      type: "compute",
      sectionProgress: input.sectionProgress,
      velocity: input.velocity,
      current: input.current,
      next: input.next,
      blend: input.blend,
      reduced: input.reduced,
      _kfCurrent: input.kfCurrent,
      _kfNext: input.kfNext,
    };

    if (workerRef.current) {
      workerRef.current.postMessage(payload);
    } else {
      // Inline fallback — same math as the worker, on the main thread
      const res = computeInline(payload);
      handlerRef.current(res);
    }
  };

  return post;
}

/** Mirrors the worker's math for fallback / testing. */
function computeInline(
  msg: ScrollMathRequest & { _kfCurrent: SceneKeyframe; _kfNext: SceneKeyframe }
): ScrollMathResponse {
  if (msg.reduced) {
    return {
      type: "computed",
      x: 0, y: 0, z: 0,
      rotationOffset: 0,
      scale: 0.85,
      dipOffset: 0,
      tilt: 0,
    };
  }

  const a = msg._kfCurrent;
  const b = msg._kfNext;
  const t = msg.blend;
  const lerp = (x: number, y: number) => x + (y - x) * t;

  const dipEase = (tt: number) => {
    if (tt > 0.35) return 0;
    const x = (tt - 0.1) / 0.18;
    return Math.exp(-x * x);
  };
  const dipAmount = lerp(a.dip, b.dip);
  const dipOffset = dipEase(msg.sectionProgress) * dipAmount;
  const tilt = (Math.max(-1500, Math.min(1500, msg.velocity)) / 1500) * 0.25;

  return {
    type: "computed",
    x: lerp(a.x, b.x),
    y: lerp(a.y, b.y) - dipOffset,
    z: lerp(a.z, b.z),
    rotationOffset: lerp(a.rotationOffset, b.rotationOffset),
    scale: lerp(a.scale, b.scale),
    dipOffset,
    tilt,
  };
}
