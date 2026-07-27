import Image from "next/image"
import { MapPin, Clock, Mail, Phone, ExternalLink } from "lucide-react"

export default function Location() {
  return (
    <section
      id="section-location"
      data-ball-align="right"
      className="py-24 sm:py-32 w-full relative bg-transparent md:bg-pitch-dark"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(204,255,0,0.03),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-end">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-tennis font-display text-lg font-bold uppercase tracking-widest block">
              VENUE RECONNAISSANCE
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-black italic tracking-tight text-white uppercase leading-none">
              LOCATION & <span className="text-white/60">SCHEDULE</span>
            </h2>
            <p className="text-gray-400 font-sans text-base sm:text-lg max-w-xl">
              Conveniently located with ample secure parking and quick access to transport links. Walk right in, boot up, and get bowling.
            </p>
          </div>
          <div className="lg:col-span-4 h-1" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div id="location-map-container" className="lg:col-span-6 w-full order-2 lg:order-1">
            <div className="relative border border-pitch-border bg-pitch-card rounded-sm p-3 group overflow-hidden shadow-2xl">
              <div className="relative bg-[#0d1310] h-70 sm:h-90 rounded-sm overflow-hidden border border-pitch-border">
                <Image
                  src="/map-address.png"
                  alt="Nazimabad Indoor Sports location on Google Maps"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10 flex justify-between items-start p-4">
                  <div className="bg-black/80 backdrop-blur-md px-3.5 py-1.5 border border-white/20 rounded-sm">
                    <span className="font-display text-sm font-extrabold text-white tracking-wide uppercase">
                      NAZIMABAD INDOOR SPORTS BY SPORTEFY
                    </span>
                  </div>
                  <a
                    href="https://www.google.com/maps/dir//Nazimabad+indoor+sports,+Plot+C+1,+6A,+Block+2+Nazimabad,+Karachi,+74600,+Pakistan/@24.82176,67.0531584,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3eb33f000bc3a41d:0x579bf22139dbf798!2m2!1d67.0315135!2d24.9072156?hl=en-PK&entry=ttu&g_ep=EgoyMDI2MDcyMi4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-tennis text-black hover:bg-tennis-dim px-3 py-1.5 rounded-sm font-display font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 focus-visible:outline-none shadow-lg"
                    aria-label="Open Nazimabad Indoor Sports on Google Maps (External Link)"
                  >
                    DIRECTIONS <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="absolute top-[52%] left-[46%] w-10 h-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <span className="absolute inset-0 rounded-full bg-tennis/50 animate-ping" />
                  <span className="absolute top-3 left-3 w-4 h-4 rounded-full bg-tennis border-2 border-black shadow-[0_0_10px_#ccff00]" />
                </div>
              </div>
            </div>
          </div>

          <div id="location-info-container" className="lg:col-span-6 space-y-8 order-1 lg:order-2">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 shrink-0 bg-tennis/10 border border-tennis/30 rounded-sm flex items-center justify-center text-tennis">
                <MapPin className="w-5 h-5 stroke-2" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-extrabold text-white uppercase tracking-tight">
                  STREET ARCHITECTURE
                </h3>
                <p className="text-gray-300 font-sans text-base">
                  Plot C 1, 6A, Block 2 Nazimabad, <br /> Karachi, 74600
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 shrink-0 bg-tennis/10 border border-tennis/30 rounded-sm flex items-center justify-center text-tennis">
                <Clock className="w-5 h-5 stroke-2" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-extrabold text-white uppercase tracking-tight">
                  OPERATING WINDOW
                </h3>
                <div className="text-gray-300 font-sans text-sm space-y-1">
                  <div className="flex justify-between w-64 border-b border-pitch-border/30 pb-0.5">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="text-tennis">06:00 AM - 12:00 AM</span>
                  </div>
                  <div className="flex justify-between w-64 border-b border-pitch-border/30 pb-0.5">
                    <span className="font-medium">Saturday - Sunday</span>
                    <span className="text-tennis">05:00 AM - 01:00 AM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 shrink-0 bg-tennis/10 border border-tennis/30 rounded-sm flex items-center justify-center text-tennis">
                <Mail className="w-5 h-5 stroke-2" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-extrabold text-white uppercase tracking-tight">
                  DIRECT COMMUNICATOR
                </h3>
                <p className="text-gray-300 font-sans text-sm flex flex-col space-y-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-tennis/80" /> nazimabadindoorsports@gmail.com
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-tennis/80" /> +92 315 2259679
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
