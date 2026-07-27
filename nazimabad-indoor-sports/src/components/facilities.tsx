import { ShieldAlert, Zap, Compass, Sparkles } from "lucide-react"

export default function Facilities() {
  return (
    <section
      id="section-facilities"
      data-ball-align="left"
      className="py-24 sm:py-32 w-full relative bg-transparent md:bg-[#0a0e0c]"
    >
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-pitch-dark/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-end">
          <div className="lg:col-span-4 h-1" />
          <div className="reveal-header lg:col-span-8 space-y-4">
            <span className="text-tennis font-display text-lg font-bold uppercase tracking-widest block">
              OUR PLAYING ENVIRONMENT
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-black italic tracking-tight text-white uppercase leading-none">
              ENGINEERED FOR <span className="text-white/60">PERFORMANCE</span>
            </h2>
            <p className="text-gray-400 font-sans text-base sm:text-lg max-w-2xl">
              Every detail of Nazimabad Indoor Sports has been precision-designed to match real match-day physics. We stripped away the dust, the damp, and the bad bounces of traditional indoor nets to construct a training heaven.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div
            id="facility-card-1"
            className="group relative bg-[#121815] border border-pitch-border hover:border-tennis/40 rounded-sm p-6 sm:p-8 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-tennis/10 border border-tennis/30 rounded-sm flex items-center justify-center text-tennis">
                <Compass className="w-6 h-6 stroke-2" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold italic tracking-tight text-white uppercase group-hover:text-tennis transition-colors">
                22-YARD SYNTHETIC TURF
              </h3>
              <p className="text-gray-400 font-sans text-sm leading-relaxed">
                Step onto professional-grade synthetic turf engineered with standard international match dimensions. Configured for true ball-bounce dynamics, allowing spinners to grip and turn the ball while pacers enjoy realistic carry and shoulder height.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-tennis font-display font-semibold text-xs tracking-widest uppercase">
              <Sparkles className="w-4 h-4 text-tennis" /> TOURNAMENT GRADE
            </div>
          </div>

          <div
            id="facility-card-2"
            className="group relative bg-[#121815] border border-pitch-border hover:border-tennis/40 rounded-sm p-6 sm:p-8 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-tennis/10 border border-tennis/30 rounded-sm flex items-center justify-center text-tennis">
                <ShieldAlert className="w-6 h-6 stroke-2" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold italic tracking-tight text-white uppercase group-hover:text-tennis transition-colors">
                ADJUSTABLE BOUNDARY NETS
              </h3>
              <p className="text-gray-400 font-sans text-sm leading-relaxed">
                Tailor your session for aggressive batting drills or casual match play. High-tensile ceiling-to-floor netting keeps balls safely contained within the pitch. Outfitted with automatic spring-stumps.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-tennis font-display font-semibold text-xs tracking-widest uppercase">
              <Sparkles className="w-4 h-4 text-tennis" /> HIGH-TENSILE DEFENSE
            </div>
          </div>

          <div
            id="facility-card-3"
            className="group relative bg-[#121815] border border-pitch-border hover:border-tennis/40 rounded-sm p-6 sm:p-8 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-tennis/10 border border-tennis/30 rounded-sm flex items-center justify-center text-tennis">
                <Zap className="w-6 h-6 stroke-2" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold italic tracking-tight text-white uppercase group-hover:text-tennis transition-colors">
                FLOODLIT AC ARENA
              </h3>
              <p className="text-gray-400 font-sans text-sm leading-relaxed">
                Train in crystal-clear comfort under high-lux overhead sports LED floodlights that eliminate shadows. Our state-of-the-art enclosed air cooling climate control system keeps players fresh at a constant 19°C all year.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-tennis font-display font-semibold text-xs tracking-widest uppercase">
              <Sparkles className="w-4 h-4 text-tennis" /> CLIMATE DESIGNED
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
