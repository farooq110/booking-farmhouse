"use client"

import dynamic from "next/dynamic"

const CricketBallCanvas = dynamic(
  () => import("./cricket-ball-canvas"),
  { ssr: false },
)

export default function CricketBallViewport() {
  return <CricketBallCanvas />
}
