"use client";
/**
 * ThemedAppLoader — first-paint loader shown until the page is hydrated.
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MEDIA, FARMHOUSE } from "@/data/media";

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
        <Image
          src={MEDIA.logo}
          alt={`${FARMHOUSE.name} logo`}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />
      </div>
      <p className="cf-app-loader__label">{FARMHOUSE.name}</p>
    </div>
  );
}
