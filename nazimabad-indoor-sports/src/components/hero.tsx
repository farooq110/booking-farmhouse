"use client"

import { ArrowRight, Sparkles } from "lucide-react"

export default function Hero() {
  const handleScrollToCta = () => {
    const ctaSection = document.getElementById("section-cta")
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleScrollToFacilities = () => {
    const facilitiesSection = document.getElementById("section-gallery")
    if (facilitiesSection) {
      facilitiesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="section-hero"
      data-ball-align="right"
      className="min-h-screen w-full relative flex items-center justify-center pt-24 pb-16 px-4 sm:px-8 overflow-hidden bg-transparent md:bg-linear-to-b md:from-pitch-dark md:to-pitch-dark/95"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(29,40,34,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(29,40,34,0.15)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20">
        <div className="lg:col-span-7 flex flex-col items-start space-y-6 sm:space-y-8 text-left animate-fade-in">
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black italic tracking-tight leading-none text-white uppercase">
            RECLAIM YOUR <br />
            <span className="text-tennis shadow-sm">MATCH DAY</span>
          </h1>

          <p className="text-gray-300 text-lg sm:text-xl max-w-xl leading-relaxed font-sans font-light">
            Don’t let weather cancel your innings. Walk onto our professional, full-length synthetic pitch lit by high-intensity sports floodlights. Built for serious cricket groups, weekend warriors, and dedicated training sessions.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
            <button
              onClick={handleScrollToCta}
              className="flex items-center justify-center gap-3 bg-tennis text-black hover:bg-tennis-dim font-display text-xl font-extrabold px-8 py-4 rounded-sm transition-transform active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)]"
              aria-label="Check arena availability and book"
              id="hero-primary-cta"
            >
              CHECK AVAILABILITY
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={handleScrollToFacilities}
              className="flex items-center justify-center gap-2 border border-white/20 hover:border-tennis hover:text-tennis text-white font-display text-lg font-bold px-7 py-4 rounded-sm bg-white/5 transition-colors active:scale-95 cursor-pointer"
              aria-label="Explore our training facilities"
              id="hero-secondary-cta"
            >
              EXPLORE ARENA
            </button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-6 border-t border-pitch-border w-full text-gray-400 font-display text-sm tracking-widest">
            <div className="flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4 text-tennis" /> No Rainouts
            </div>
            <div className="flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4 text-tennis" /> Professional Pitch
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-5 h-100 pointer-events-none" />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-0.75 bg-linear-to-r from-tennis/10 via-tennis to-tennis/10" />
    </section>
  )
}
