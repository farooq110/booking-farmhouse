"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function CricketBallCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const stateRef = useRef({
    x: 0.3,
    y: 0.0,
    z: 0.0,
    scaleX: 1.0,
    scaleY: 1.0,
    scaleZ: 1.0,
    spinX: 0.005,
    spinY: 0.012,
    stumpsKnocked: 0.0,
    stumpsY: -1.5,
    stumpsX: 0.3,
    cardsRotation: 0.0,
    cardsSpread: 1.0,
    cardsScale: 1.0,
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container || initializedRef.current) return
    initializedRef.current = true

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    const W = window.innerWidth
    const H = window.innerHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
    camera.position.z = 6

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    container.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 1.5))

    const floodlight = new THREE.DirectionalLight(0xfffaed, 3.5)
    floodlight.position.set(4, 6, 4)
    floodlight.castShadow = true
    scene.add(floodlight)

    const rimLight = new THREE.DirectionalLight(0xccff00, 2.0)
    rimLight.position.set(-3, 2, 3)
    scene.add(rimLight)

    const makeBallTexture = (): THREE.CanvasTexture => {
      const cv = document.createElement("canvas")
      cv.width = 1024
      cv.height = 512
      const ctx = cv.getContext("2d")!

      ctx.fillStyle = "#ccff00"
      ctx.fillRect(0, 0, cv.width, cv.height)

      ctx.strokeStyle = "#a8cf00"
      for (let i = 0; i < 30000; i++) {
        const fx = Math.random() * cv.width
        const fy = Math.random() * cv.height
        ctx.lineWidth = 1 + Math.random() * 0.5
        ctx.beginPath()
        ctx.moveTo(fx, fy)
        ctx.lineTo(fx + (Math.random() - 0.5) * 8, fy + (Math.random() - 0.5) * 8)
        ctx.stroke()
      }

      ctx.strokeStyle = "#e5ff80"
      for (let i = 0; i < 15000; i++) {
        const fx = Math.random() * cv.width
        const fy = Math.random() * cv.height
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.moveTo(fx, fy)
        ctx.lineTo(fx + (Math.random() - 0.5) * 5, fy + (Math.random() - 0.5) * 5)
        ctx.stroke()
      }

      const N = 1200
      const a = 0.46
      const pts: { u: number; v: number }[] = []
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * Math.PI * 4
        const sx = Math.cos(t) * Math.sqrt(1 - a * Math.pow(Math.sin(2 * t), 2))
        const sy = Math.sin(t) * Math.sqrt(1 - a * Math.pow(Math.sin(2 * t), 2))
        const sz = Math.sqrt(a) * Math.sin(2 * t)
        const theta = Math.atan2(sy, sx) + Math.PI
        const phi = Math.acos(Math.max(-1, Math.min(1, sz)))
        pts.push({ u: theta / (Math.PI * 2), v: phi / Math.PI })
      }

      const drawSeam = (ox: number, color: string, lw: number) => {
        ctx.strokeStyle = color
        ctx.lineWidth = lw
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        let drawing = false
        for (let i = 0; i < pts.length; i++) {
          const px = pts[i].u * cv.width + ox
          const py = pts[i].v * cv.height
          if (i === 0) {
            ctx.beginPath()
            ctx.moveTo(px, py)
            drawing = true
            continue
          }
          const jump = Math.abs(pts[i].u - pts[i - 1].u)
          if (jump < 0.4) {
            if (!drawing) {
              ctx.beginPath()
              ctx.moveTo(px, py)
              drawing = true
            } else {
              ctx.lineTo(px, py)
            }
          } else {
            if (drawing) ctx.stroke()
            drawing = false
          }
        }
        if (drawing) ctx.stroke()
      }

      ;[0, -cv.width, cv.width].forEach((ox) => {
        drawSeam(ox, "#739000", 14)
      })
      ;[0, -cv.width, cv.width].forEach((ox) => {
        drawSeam(ox, "#f7f9f2", 7)
      })

      return new THREE.CanvasTexture(cv)
    }

    const ballTexture = makeBallTexture()

    const ballGeo = new THREE.SphereGeometry(0.65, 64, 64)
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.85,
      metalness: 0.05,
      emissive: new THREE.Color(0x334400),
      emissiveIntensity: 0.3,
    })
    const ball = new THREE.Mesh(ballGeo, ballMat)
    ball.castShadow = true
    scene.add(ball)

    const cardsGroup = new THREE.Group()
    scene.add(cardsGroup)

    const cardConfig = [
      { text: "SPEED", color: "#00f0ff" },
      { text: "POWER", color: "#ff007f" },
      { text: "TURF", color: "#ccff00" },
      { text: "LIGHTS", color: "#ffaa00" },
      { text: "SLOTS", color: "#39ff14" },
      { text: "PRECISION", color: "#ff5500" },
      { text: "NETS", color: "#00ffcc" },
      { text: "TACTICS", color: "#b500ff" },
    ]

    const makeCardTexture = (text: string, color: string): THREE.CanvasTexture => {
      const cv = document.createElement("canvas")
      cv.width = 256
      cv.height = 384
      const ctx = cv.getContext("2d")!

      ctx.clearRect(0, 0, cv.width, cv.height)

      ctx.fillStyle = "rgba(8, 12, 10, 0.92)"
      const radius = 16
      ctx.beginPath()
      ctx.moveTo(radius, 0)
      ctx.lineTo(cv.width - radius, 0)
      ctx.quadraticCurveTo(cv.width, 0, cv.width, radius)
      ctx.lineTo(cv.width, cv.height - radius)
      ctx.quadraticCurveTo(cv.width, cv.height, cv.width - radius, cv.height)
      ctx.lineTo(radius, cv.height)
      ctx.quadraticCurveTo(0, cv.height, 0, cv.height - radius)
      ctx.lineTo(0, radius)
      ctx.quadraticCurveTo(0, 0, radius, 0)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = color
      ctx.lineWidth = 6
      ctx.stroke()

      ctx.fillStyle = color + "1a"
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(24, 24, cv.width - 48, 36, 6)
      } else {
        ctx.rect(24, 24, cv.width - 48, 36)
      }
      ctx.fill()
      ctx.strokeStyle = color + "44"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = color
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("ELIXIR ARENA", cv.width / 2, 42)

      ctx.fillStyle = "#ffffff"
      ctx.font = "italic bold 28px sans-serif"
      ctx.fillText(text, cv.width / 2, cv.height / 2 + 10)

      ctx.fillStyle = color + "cc"
      ctx.font = "900 12px sans-serif"
      ctx.fillText("LIVE SESSION", cv.width / 2, cv.height - 40)

      return new THREE.CanvasTexture(cv)
    }

    const cardGeo = new THREE.PlaneGeometry(0.5, 0.75)
    const cards: THREE.Mesh[] = []
    const cardTextures: THREE.CanvasTexture[] = []
    const cardMaterials: THREE.MeshBasicMaterial[] = []

    cardConfig.forEach((cfg, idx) => {
      const tex = makeCardTexture(cfg.text, cfg.color)
      cardTextures.push(tex)

      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      cardMaterials.push(mat)

      const cardMesh = new THREE.Mesh(cardGeo, mat)

      const theta = (idx / cardConfig.length) * Math.PI * 2
      const baseRad = 1.3
      cardMesh.position.set(Math.cos(theta) * baseRad, Math.sin(theta) * baseRad, 0)
      cardMesh.rotation.z = theta - Math.PI / 2

      cardsGroup.add(cardMesh)
      cards.push(cardMesh)
    })

    const wicketGroup = new THREE.Group()
    scene.add(wicketGroup)

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xff5500,
      roughness: 0.4,
      metalness: 0.3,
    })
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.6,
      metalness: 0.8,
    })
    const SH = 1.2
    const SR = 0.035

    const basePlateGeo = new THREE.BoxGeometry(0.8, 0.04, 0.18)
    const basePlate = new THREE.Mesh(basePlateGeo, ironMat)
    basePlate.position.y = -SH / 2 - 0.02
    wicketGroup.add(basePlate)

    const makeStump = (xPos: number) => {
      const g = new THREE.Group()
      g.position.set(xPos, 0, 0)
      const m = new THREE.Mesh(new THREE.CylinderGeometry(SR, SR, SH, 16), woodMat)
      m.castShadow = true
      g.add(m)
      wicketGroup.add(g)
      return g
    }
    const stumpLeft = makeStump(-0.24)
    const stumpMiddle = makeStump(0)
    const stumpRight = makeStump(0.24)

    const makeBail = (xPos: number) => {
      const g = new THREE.Group()
      g.position.set(xPos, SH / 2 + 0.02, 0)
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 16), ironMat)
      m.rotation.z = Math.PI / 2
      m.castShadow = true
      g.add(m)
      wicketGroup.add(g)
      return g
    }
    const bailLeft = makeBail(-0.12)
    const bailRight = makeBail(0.12)

    let w3D = 0
    let h3D = 0
    const calcBounds = () => {
      h3D = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
      w3D = h3D * camera.aspect
    }
    calcBounds()

    let mainTl: gsap.core.Timeline | null = null

    if (!prefersReducedMotion) {
      const state = stateRef.current

      const sections = Array.from(
        document.querySelectorAll("#main-scroll-container > section"),
      )
      const numSections = sections.length

      mainTl = gsap.timeline({
        scrollTrigger: {
          id: "elixir-scroll",
          trigger: "#main-scroll-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })

      if (numSections > 1) {
        const interval = 1 / (numSections - 1)

        for (let i = 0; i < numSections - 1; i++) {
          const currentSec = sections[i]
          const nextSec = sections[i + 1]

          const startOffset = i * interval
          const endOffset = (i + 1) * interval

          const nextAlign = nextSec.getAttribute("data-ball-align") || "right"
          const nextX = nextAlign === "left" ? -0.28 : 0.28
          const nextY = nextAlign === "left" ? 0.1 : 0.0

          const isWicketSmash =
            nextSec.getAttribute("data-ball-action") === "wicket-smash"

          if (isWicketSmash) {
            const duration = endOffset - startOffset

            mainTl.to(
              state,
              {
                stumpsY: -0.15,
                z: -3.0,
                x: nextX,
                y: 0.2,
                duration: duration * 0.25,
                ease: "power1.out",
              },
              startOffset,
            )

            mainTl.to(
              state,
              {
                x: 0.28,
                y: -0.14,
                z: 0.3,
                duration: duration * 0.5,
                ease: "power3.in",
              },
              startOffset + duration * 0.25,
            )

            mainTl.to(
              state,
              {
                scaleX: 0.75,
                scaleY: 0.75,
                scaleZ: 1.4,
                stumpsKnocked: 1.0,
                duration: duration * 0.1,
                ease: "power2.out",
              },
              startOffset + duration * 0.75,
            )

            mainTl.to(
              state,
              {
                x: 0.38,
                y: 0.1,
                z: 1.0,
                scaleX: 1.0,
                scaleY: 1.0,
                scaleZ: 1.0,
                duration: duration * 0.15,
                ease: "power2.out",
              },
              startOffset + duration * 0.85,
            )
          } else {
            if (i === 0) {
              mainTl.to(
                state,
                {
                  x: nextX,
                  y: nextY,
                  duration: interval,
                  ease: "power1.inOut",
                },
                startOffset,
              )

              mainTl.to(
                state,
                {
                  cardsRotation: Math.PI * 1.5,
                  cardsSpread: 2.5,
                  cardsScale: 0.0,
                  duration: interval,
                  ease: "power2.inOut",
                },
                startOffset,
              )
            } else {
              const currAlign = currentSec.getAttribute("data-ball-align") || "right"
              if (currAlign === nextAlign) {
                mainTl.to(
                  state,
                  {
                    x: nextX * 0.4,
                    y: nextY * 1.2,
                    duration: interval * 0.5,
                    ease: "power1.out",
                  },
                  startOffset,
                )

                mainTl.to(
                  state,
                  {
                    x: nextX,
                    y: nextY,
                    duration: interval * 0.5,
                    ease: "power1.in",
                  },
                  startOffset + interval * 0.5,
                )
              } else {
                mainTl.to(
                  state,
                  {
                    x: nextX,
                    y: nextY,
                    duration: interval,
                    ease: "power1.inOut",
                  },
                  startOffset,
                )
              }
            }
          }
        }
      }
    }

    let rafId: number
    let rx = 0
    let ry = 0

    const tick = () => {
      const s = stateRef.current
      calcBounds()

      if (prefersReducedMotion) {
        ball.position.set(0.25 * w3D, 0.15 * h3D, 0)
        ball.scale.set(1, 1, 1)
        rx += 0.003
        ry += 0.006
      } else {
        ball.position.set(s.x * w3D, s.y * h3D, s.z)
        ball.scale.set(s.scaleX, s.scaleY, s.scaleZ)

        const st = ScrollTrigger.getById("elixir-scroll")
        const vel = st ? Math.abs(st.getVelocity()) : 0
        const spin = 1 + Math.min(vel * 0.005, 5)
        rx += s.spinX * spin
        ry += s.spinY * spin
      }

      ball.rotation.set(rx, ry, 0)

      cardsGroup.position.copy(ball.position)

      let baseRot = 0
      if (prefersReducedMotion) {
        cardsGroup.scale.set(0, 0, 0)
      } else {
        cardsGroup.scale.set(ball.scale.x, ball.scale.y, ball.scale.z)
        baseRot = Date.now() * 0.0004 + s.cardsRotation
      }
      cardsGroup.rotation.z = baseRot

      const baseRadius = 1.3
      const currentRadius = baseRadius * s.cardsSpread
      cards.forEach((card, idx) => {
        const theta = (idx / cards.length) * Math.PI * 2
        card.position.set(
          Math.cos(theta) * currentRadius,
          Math.sin(theta) * currentRadius,
          0,
        )
        card.scale.set(s.cardsScale, s.cardsScale, s.cardsScale)
      })

      wicketGroup.position.y = s.stumpsY * h3D
      wicketGroup.position.x = 0.28 * w3D

      const k = s.stumpsKnocked
      if (k > 0) {
        stumpMiddle.rotation.x = -k * 1.6
        stumpMiddle.rotation.z = -k * 0.3
        stumpMiddle.position.y = -k * 0.2
        stumpMiddle.position.z = -k * 0.9

        stumpLeft.rotation.z = -k * 1.4
        stumpLeft.rotation.x = -k * 0.7
        stumpLeft.position.x = -0.24 - k * 0.6
        stumpLeft.position.y = -k * 0.1

        stumpRight.rotation.z = k * 1.4
        stumpRight.rotation.x = -k * 0.7
        stumpRight.position.x = 0.24 + k * 0.6
        stumpRight.position.y = -k * 0.1

        bailLeft.position.x = -0.12 - k * 0.9
        bailLeft.position.y = SH / 2 + 0.02 + k * 1.8
        bailLeft.position.z = k * 1.2
        bailLeft.rotation.set(k * 6, k * 4, k * 3)

        bailRight.position.x = 0.12 + k * 0.9
        bailRight.position.y = SH / 2 + 0.02 + k * 2.1
        bailRight.position.z = k * 0.8
        bailRight.rotation.set(-k * 5, k * 5, -k * 4)
      } else {
        stumpMiddle.rotation.set(0, 0, 0)
        stumpMiddle.position.set(0, 0, 0)
        stumpLeft.rotation.set(0, 0, 0)
        stumpLeft.position.set(-0.24, 0, 0)
        stumpRight.rotation.set(0, 0, 0)
        stumpRight.position.set(0.24, 0, 0)
        bailLeft.position.set(-0.12, SH / 2 + 0.02, 0)
        bailLeft.rotation.set(0, 0, 0)
        bailRight.position.set(0.12, SH / 2 + 0.02, 0)
        bailRight.rotation.set(0, 0, 0)
      }

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }

    tick()

    const onResize = () => {
      const nw = window.innerWidth
      const nh = window.innerHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
      calcBounds()
    }
    window.addEventListener("resize", onResize)

    return () => {
      initializedRef.current = false
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", onResize)
      if (mainTl) {
        mainTl.kill()
        ScrollTrigger.getAll().forEach((t) => {
          t.kill()
        })
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      ballGeo.dispose()
      ballMat.dispose()
      ballTexture.dispose()
      woodMat.dispose()
      ironMat.dispose()
      basePlateGeo.dispose()

      cardGeo.dispose()
      cardMaterials.forEach((m) => {
        m.dispose()
      })
      cardTextures.forEach((t) => {
        t.dispose()
      })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id="cricket-3d-viewport"
      className="fixed inset-0 w-full h-full pointer-events-none z-10 md:z-30 overflow-hidden opacity-25 md:opacity-100"
      aria-hidden="true"
    />
  )
}
