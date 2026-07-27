"use client"

import { useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function AppAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(
          "#section-hero h1",
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power4.out", clearProps: "all" },
        )
        .fromTo(
          "#section-hero p",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "all" },
          "-=0.6",
        )
        .fromTo(
          "#section-hero button",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.6,
            ease: "power2.out",
            clearProps: "all",
          },
          "-=0.5",
        )
        .fromTo(
          "#section-hero .border-t > div",
          { y: 15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.5,
            ease: "power2.out",
            clearProps: "all",
          },
          "-=0.4",
        )
    })

    const revealSets: {
      selector: string
      animClass: string
      stagger?: boolean
      slideLeft?: boolean
    }[] = [
      { selector: "#section-facilities .reveal-header", animClass: "reveal-fade-up" },
      { selector: "[id^='facility-card-']", animClass: "reveal-fade-up", stagger: true },
      { selector: "#section-gallery .reveal-header", animClass: "reveal-fade-up" },
      { selector: "[id^='photo-']", animClass: "reveal-fade-up", stagger: true },
      { selector: "#location-map-container", animClass: "reveal-slide-left", slideLeft: true },
      { selector: "#location-info-container > div", animClass: "reveal-fade-up", stagger: true },
      { selector: "#cta-form-container", animClass: "reveal-fade-up" },
      { selector: "#section-cta .reveal-header", animClass: "reveal-fade-up" },
    ]

    const observers: IntersectionObserver[] = []

    revealSets.forEach(({ selector, animClass, stagger, slideLeft }) => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector))
      if (!elements.length) return

      elements.forEach((el) => {
        el.setAttribute("data-reveal", "pending")
        el.classList.add("gsap-reveal-pending")
        if (slideLeft) el.classList.add("reveal-slide-left-pending")
      })

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const el = entry.target as HTMLElement

            if (stagger) {
              const siblings = Array.from(
                document.querySelectorAll<HTMLElement>(selector),
              )
              siblings.forEach((sib, i) => {
                if (sib.getAttribute("data-reveal") === "done") return
                setTimeout(() => {
                  sib.classList.remove("gsap-reveal-pending")
                  sib.classList.add(animClass, "gsap-reveal-done")
                  sib.setAttribute("data-reveal", "done")
                }, i * 120)
              })
              observer.disconnect()
            } else {
              el.classList.remove("gsap-reveal-pending")
              el.classList.add(animClass, "gsap-reveal-done")
              el.setAttribute("data-reveal", "done")
              observer.unobserve(el)
            }
          })
        },
        { threshold: 0.15 },
      )

      if (stagger) {
        observer.observe(elements[0])
      } else {
        elements.forEach((el) => {
          observer.observe(el)
        })
      }

      observers.push(observer)
    })

    return () => {
      ctx.revert()
      observers.forEach((obs) => {
        obs.disconnect()
      })
      document.querySelectorAll(".gsap-reveal-pending").forEach((el) => {
        el.classList.remove("gsap-reveal-pending")
      })
    }
  }, [])

  return null
}
