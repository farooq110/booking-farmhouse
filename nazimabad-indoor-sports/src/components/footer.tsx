import { Activity } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-[#080c0a] border-t border-pitch-border/80 py-12 px-4 sm:px-8 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-tennis/10 p-1 rounded-sm text-tennis flex items-center justify-center">
            <Activity className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-display text-lg font-black tracking-wider text-white uppercase">
            NAZIMABAD <span className="text-tennis">INDOOR SPORTS</span>
          </span>
        </div>

        <p className="text-gray-500 font-sans text-xs text-center md:text-left">
          &copy; {currentYear} Nazimabad Indoor Sports. All rights reserved. Indoor cricket facilities configured in accordance with national club dimensional guidelines.
        </p>

        <div className="flex items-center gap-6 text-gray-400 font-sans text-xs uppercase tracking-wider font-semibold">
          <a href="#" className="hover:text-tennis transition-colors focus-visible:outline-none">
            TERMS
          </a>
          <span className="w-1 h-1 rounded-full bg-pitch-border" />
          <a href="#" className="hover:text-tennis transition-colors focus-visible:outline-none">
            PRIVACY
          </a>
          <span className="w-1 h-1 rounded-full bg-pitch-border" />
          <a href="#" className="hover:text-tennis transition-colors focus-visible:outline-none">
            POLICIES
          </a>
        </div>
      </div>
    </footer>
  )
}
