"use client";
/**
 * HeroBackgroundSlider — full-bleed rotating hero background.
 *
 * Cycles through 3-4 images. Each transition picks a RANDOM effect
 * from a pool of four: fade, slide, zoom-pan (Ken Burns), and reveal
 * (clip-path wipe). Distinct from the previous single hero video.
 *
 * Built on framer-motion's AnimatePresence so old slides exit as new
 * slides enter. Honors `prefers-reduced-motion` by falling back to a
 * gentle cross-fade.
 */
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Transition } from "framer-motion";

interface Slide {
  src: unknown;
  alt: string;
}

interface HeroBackgroundSliderProps {
  slides: Slide[];
  /** Seconds each slide stays on screen before the next transition. */
  intervalMs?: number;
}

type EffectKey = "fade" | "slide" | "zoomPan" | "reveal";

const ALL_EFFECTS: EffectKey[] = ["fade", "slide", "zoomPan", "reveal"];

/**
 * Pick a random effect that's different from the last one used.
 */
function pickRandomEffect(prev: EffectKey | null): EffectKey {
  const pool = ALL_EFFECTS.filter((e) => e !== prev);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Build the framer-motion variants for a given effect.
 * Each effect returns { initial, animate, exit } plus an optional
 * `kenBurns` flag to keep the slide slowly panning while it's active.
 */
function getVariants(effect: EffectKey) {
  switch (effect) {
    case "fade":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        kenBurns: false,
      };
    case "slide":
      return {
        // Slide in from the right, exit to the left
        initial: { opacity: 0, x: "100%" },
        animate: { opacity: 1, x: "0%" },
        exit: { opacity: 0, x: "-100%" },
        kenBurns: false,
      };
    case "zoomPan":
      // Ken Burns — start zoomed-in and pan slowly across the image
      return {
        initial: { opacity: 0, scale: 1.25, x: "-3%", y: "-2%" },
        animate: { opacity: 1, scale: 1.05, x: "0%", y: "0%" },
        exit: { opacity: 0, scale: 1.0 },
        kenBurns: true,
      };
    case "reveal":
      // Clip-path wipe from left to right
      return {
        initial: { opacity: 1, clipPath: "inset(0 100% 0 0)" },
        animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
        exit: { opacity: 0, clipPath: "inset(0 0% 0 100%)" },
        kenBurns: false,
      };
  }
}

const SPRING: Transition = { duration: 1.1, ease: [0.22, 1, 0.36, 1] };

export function HeroBackgroundSlider({
  slides,
  intervalMs = 6000,
}: HeroBackgroundSliderProps) {
  const [index, setIndex] = useState(0);
  const [effect, setEffect] = useState<EffectKey | null>(null);
  const [reduced, setReduced] = useState(false);

  // Detect prefers-reduced-motion once on mount
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Pre-pick a deterministic sequence of effects so SSR + first paint
  // matches client. We useMemo on the slides length so it's stable.
  const effectOrder = useMemo(() => {
    const order: EffectKey[] = [];
    let prev: EffectKey | null = null;
    const count = Math.max(slides.length, 8);
    for (let i = 0; i < count; i++) {
      const next = pickRandomEffect(prev);
      order.push(next);
      prev = next;
    }
    return order;
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
      setEffect((prev) => {
        // Advance through the pre-computed random sequence
        const nextIndex = (index + 1) % effectOrder.length;
        return effectOrder[nextIndex];
      });
    }, intervalMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, intervalMs]);

  // Initialize the effect for the first slide
  useEffect(() => {
    if (effect === null && effectOrder.length > 0) {
      setEffect(effectOrder[0]);
    }
  }, [effect, effectOrder]);

  if (!slides.length) return null;
  const current = slides[index];
  // If only one slide, or reduced motion → no AnimatePresence dance.
  if (slides.length === 1 || reduced) {
    return (
      <div className="absolute inset-0 h-full w-full">
        <Image
          // @ts-expect-error — slide.src may be StaticImageData or string
          src={current.src}
          alt={current.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    );
  }

  // Use the effect tracked for this transition (fallback to fade for the very first paint)
  const activeEffect: EffectKey = effect ?? "fade";
  const variants = getVariants(activeEffect);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={index}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={SPRING}
          className="absolute inset-0 h-full w-full"
        >
          <motion.div
            className="absolute inset-0 h-full w-full"
            animate={
              variants.kenBurns
                ? { scale: [1.05, 1.12], x: ["0%", "2%"], y: ["0%", "-1%"] }
                : undefined
            }
            transition={
              variants.kenBurns
                ? { duration: intervalMs / 1000 + 1, ease: "linear" }
                : undefined
            }
          >
            <Image
              // @ts-expect-error — slide.src may be StaticImageData or string
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Slide counter pill — bottom-right, subtle */}
      <div className="pointer-events-none absolute bottom-6 right-6 z-10 flex items-center gap-2 rounded-full bg-charcoal/40 px-3 py-1.5 backdrop-blur-md ring-1 ring-cream/20">
        <span className="font-sans text-[10px] uppercase tracking-luxe text-cream/85">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="h-px w-3 bg-cream/40" />
        <span className="font-sans text-[10px] uppercase tracking-luxe text-cream/55">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Progress dots — bottom-center, sage pills */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
        {slides.map((_, i) => (
          <span
            key={i}
            className={[
              "h-1.5 rounded-full transition-all duration-500",
              i === index ? "w-8 bg-sage-soft" : "w-1.5 bg-cream/45",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
