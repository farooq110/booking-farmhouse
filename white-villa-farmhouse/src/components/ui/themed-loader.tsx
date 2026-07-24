"use client";
/**
 * ThemedAppLoader — first-paint loader shown until the page is hydrated.
 *
 * Uses the reusable <Logo> component which automatically falls back to
 * a default SVG home icon if no logo image is provided.
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FARMHOUSE } from "@/data/media";
import { Logo } from "@/components/ui/logo";

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
        <Logo size={48} className="h-12 w-12 rounded-full object-cover" />
      </div>
      <p className="cf-app-loader__label">{FARMHOUSE.name}</p>
    </div>
  );
}