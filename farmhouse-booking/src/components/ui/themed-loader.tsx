"use client";
/**
 * ThemedAppLoader — first-paint loader shown until the page is hydrated.
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemedAppLoader() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => { setHidden(true); });
      raf1 = raf2 as unknown as number;
    });
    const fallback = window.setTimeout(() => setHidden(true), 2500);
    return () => { cancelAnimationFrame(raf1); window.clearTimeout(fallback); };
  }, []);
  return (
    <div aria-hidden="true" className={cn("cf-app-loader", hidden && "is-hidden")}>
      <div className="cf-app-loader__mark">
        <span className="material-symbols-outlined text-3xl">cottage</span>
      </div>
      <p className="cf-app-loader__label">Country Farm</p>
    </div>
  );
}
