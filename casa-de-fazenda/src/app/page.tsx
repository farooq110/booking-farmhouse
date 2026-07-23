"use client";

// ── Suppress the THREE.Clock deprecation warning ──
// @react-three/fiber creates `new THREE.Clock()` internally, which logs a
// deprecation warning. Patch console.warn at module level (runs before the
// lazy-loaded 3D scene) to filter it out.
if (typeof window !== "undefined") {
  const _origWarn = console.warn;
  console.warn = function (...args: unknown[]) {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
    _origWarn.apply(console, args as never[]);
  };
}

import { SiteHeader } from "@/components/sections/SiteHeader";
import { Hero } from "@/components/sections/Hero";
import { Estate } from "@/components/sections/Estate";
import { Facilities } from "@/components/sections/Facilities";
import { Gallery } from "@/components/sections/Gallery";
import { VideoGallery } from "@/components/sections/VideoGallery";
import { Location } from "@/components/sections/Location";
import { EnquireNow } from "@/components/sections/EnquireNow";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <Estate />
      <Facilities />
      <Gallery />
      <VideoGallery />
      <Location />
      <EnquireNow />
      <Footer />
    </main>
  );
}