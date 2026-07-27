import { Users, CreditCard, Activity } from "lucide-react"

export default function HowItWorks() {
  return (
    <section
      id="section-how-it-works"
      data-ball-align="right"
      className="py-24 sm:py-32 w-full relative bg-transparent md:bg-pitch-dark"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(204,255,0,0.04),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-end">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-tennis font-display text-lg font-bold uppercase tracking-widest block">
              THREE-STEP DEPLOYMENT
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-black italic tracking-tight text-white uppercase leading-none">
              HOW TO <span className="text-tennis">BOOK</span> & PLAY
            </h2>
            <p className="text-gray-400 font-sans text-base sm:text-lg max-w-xl">
              We’ve automated the booking friction out of the game. Our contactless access system puts you in control of your session without wasting time on check-in lines.
            </p>
          </div>
          <div className="lg:col-span-4 h-1" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div
              id="step-card-1"
              className="flex flex-col sm:flex-row gap-6 bg-[#121815] border border-pitch-border hover:border-tennis/25 p-6 sm:p-8 rounded-sm transition-all"
            >
              <div className="font-display text-5xl sm:text-6xl font-black text-tennis/30 leading-none sm:w-20">
                01
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-tennis" />
                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight">
                    SELECT YOUR FIELDING WINDOW
                  </h3>
                </div>
                <p className="text-gray-400 font-sans text-sm sm:text-base leading-relaxed">
                  Browse real-time pitch availability directly on our portal. Book slots starting from 60 to 180 minutes. Our booking ledger displays live availability so you can choose exactly when you want to play.
                </p>
              </div>
            </div>

            <div
              id="step-card-2"
              className="flex flex-col sm:flex-row gap-6 bg-[#121815] border border-pitch-border hover:border-tennis/25 p-6 sm:p-8 rounded-sm transition-all"
            >
              <div className="font-display text-5xl sm:text-6xl font-black text-tennis/30 leading-none sm:w-20">
                02
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-tennis" />
                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight">
                    SECURE INSTANT CONFIRMATION
                  </h3>
                </div>
                <p className="text-gray-400 font-sans text-sm sm:text-base leading-relaxed">
                  Finalize your transaction through our heavily fortified, encrypted gateway. We accept all major cards and digital wallets. Your digital access keys and entry gate PINs are dispatched immediately.
                </p>
              </div>
            </div>

            <div
              id="step-card-3"
              className="flex flex-col sm:flex-row gap-6 bg-[#121815] border border-pitch-border hover:border-tennis/25 p-6 sm:p-8 rounded-sm transition-all"
            >
              <div className="font-display text-5xl sm:text-6xl font-black text-tennis/30 leading-none sm:w-20">
                03
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-tennis" />
                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight">
                    TAP IN AND SMASH IT
                  </h3>
                </div>
                <p className="text-gray-400 font-sans text-sm sm:text-base leading-relaxed">
                  Arrive 10 minutes prior to your slot. Feed your PIN code at the main hangar entryway, step into our climate-controlled arena, click on the floodlight control, and let the session begin.
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4 h-[300px] pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
