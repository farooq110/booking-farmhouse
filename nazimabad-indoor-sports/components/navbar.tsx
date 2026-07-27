"use client"

import { Calendar, Activity } from "lucide-react"

export default function Navbar() {
  const handleScrollToCta = () => {
    const ctaSection = document.getElementById("section-cta")
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#080c0a]/80 backdrop-blur-md border-b border-pitch-border px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-2 group focus-visible:outline-none"
          aria-label="Elixir Arena Home"
        >
          <div className="bg-tennis p-1.5 rounded-sm text-black flex items-center justify-center font-bold tracking-tight">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white group-hover:text-tennis transition-colors">
            ELIXIR <span className="text-tennis">ARENA</span>
          </span>
        </a>

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={handleScrollToCta}
            className="flex items-center gap-2 bg-tennis text-black hover:bg-tennis-dim font-display text-lg font-extrabold px-5 py-2 rounded-sm transition-transform active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.25)] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]"
            aria-label="Book a cricket pitch slot now"
            id="nav-cta-btn"
          >
            <Calendar className="w-4.5 h-4.5 stroke-[2.5]" />
            BOOK SLOT
          </button>
        </div>
      </div>
    </header>
  )
}
