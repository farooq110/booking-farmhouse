import Image from "next/image"
import { Camera, ZoomIn } from "lucide-react"

export default function Gallery() {
  const photos = [
    {
      id: "photo-1",
      title: "CHAMPIONSHIP MATCH SURFACE",
      category: "Match Pitch",
      desc: "Full 22-yard synthetic strip with high-impact underlayments to simulate authentic turf bounce.",
      img: "/arena-image-3.jpg",
      objectPosition: "center center",
    },
    {
      id: "photo-2",
      title: "PITCH-SIDE EQUIPMENT BAY",
      category: "Gear Setup",
      desc: "Premium match-grade cricket bats and equipment staged pitch-side, ready for your session.",
      img: "/arena-image-2.png",
      objectPosition: "center 60%",
    },
    {
      id: "photo-3",
      title: "MATCH-DAY ACTION",
      category: "Live Play",
      desc: "Real match action under high-lux floodlights — the same energy every session at Nazimabad Indoor Sports.",
      img: "/arena-image-1.jpg",
      objectPosition: "center center",
    },
    {
      id: "photo-4",
      title: "PREMIUM BATTING NETS & ENCLOSURE",
      category: "Surround Nets",
      desc: "Fully enclosed thick mesh nets preventing ball escape, ensuring complete safety during intense batting drills.",
      img: "/arena-image-2.png",
      objectPosition: "center top",
    },
  ]

  return (
    <section
      id="section-gallery"
      data-ball-align="left"
      className="py-24 sm:py-32 w-full relative bg-transparent md:bg-[#0a0e0c]"
    >
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-pitch-dark/80 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-end">
          <div className="lg:col-span-4 h-1" />
          <div className="reveal-header lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-tennis font-display text-lg font-bold uppercase tracking-widest">
              <Camera className="w-4 h-4 text-tennis" /> VISUAL TOUR
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-black italic tracking-tight text-white uppercase leading-none">
              INSIDE THE <span className="text-white/60">ARENA</span>
            </h2>
            <p className="text-gray-400 font-sans text-base sm:text-lg max-w-xl">
              Take a detailed look inside Nazimabad Indoor Sports — the pitch, the lights, the equipment. This is your match day home.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {photos.map((photo) => (
            <div
              key={photo.id}
              id={photo.id}
              className="group relative rounded-sm overflow-hidden h-75 sm:h-90 shadow-2xl border border-white/10 hover:border-tennis/40 transition-all duration-300"
            >
              <Image
                src={photo.img}
                alt={photo.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ objectPosition: photo.objectPosition }}
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-black/10 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between p-5">
                <span className="text-xs font-bold uppercase tracking-widest text-tennis bg-black/60 backdrop-blur-sm px-2.5 py-1 border border-tennis/30 rounded-sm">
                  {photo.category}
                </span>
                <div className="w-8 h-8 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-gray-400 group-hover:text-tennis group-hover:border-tennis/40 transition-colors">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-10 p-5 space-y-1">
                <h3 className="font-display text-xl sm:text-2xl font-extrabold italic tracking-tight text-white uppercase leading-tight drop-shadow-lg">
                  {photo.title}
                </h3>
                <p className="text-gray-300 font-sans text-sm leading-relaxed max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {photo.desc}
                </p>
              </div>

              <div className="absolute inset-0 bg-tennis/0 group-hover:bg-tennis/4 transition-colors pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
