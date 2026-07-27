import CricketBallViewport from "@/components/cricket-ball-viewport"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Facilities from "@/components/facilities"
import Gallery from "@/components/gallery"
import Location from "@/components/location"
import Cta from "@/components/cta"
import Footer from "@/components/footer"
import AppAnimations from "@/components/app-animations"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-pitch-dark text-white selection:bg-tennis selection:text-black font-sans overflow-x-hidden antialiased">
      <AppAnimations />
      <CricketBallViewport />
      <Navbar />

      <main
        id="main-scroll-container"
        className="relative z-20 w-full flex flex-col"
      >
        <Hero />
        <Facilities />
        <Gallery />
        <Location />
        <Cta />
        <Footer />
      </main>
    </div>
  )
}
