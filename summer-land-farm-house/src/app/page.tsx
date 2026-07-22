"use client";
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
