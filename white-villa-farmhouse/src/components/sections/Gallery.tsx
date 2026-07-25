"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MediaSlot } from "@/components/ui/media-slot";
import { SectionHeading, SectionLabel, Icon } from "@/components/ui/luxury-primitives";
import { Lightbox, useLightbox, type LightboxItem } from "@/components/ui/lightbox";
import { MEDIA } from "@/data/media";

const LIGHTBOX_ITEMS: LightboxItem[] = MEDIA.gallery.map((g) => ({
  src: g.src,
  alt: g.alt,
  caption: g.caption,
}));

const TOTAL = MEDIA.gallery.length;
const DRAG_THRESHOLD = 50; // px — minimum drag distance to trigger prev/next

/**
 * Gallery — pure state-driven 3D peek-stack carousel.
 *
 * No Embla, no Swiper — just React state + CSS transforms. This gives
 * reliable click handling on side cards and thumbnails, plus drag/swipe
 * support via pointer events.
 *
 * Layout:
 *   - All slides are absolutely positioned in a relative container.
 *   - Each slide's transform is computed from its distance to the
 *     selected index: center is flat & full-size, side slides are
 *     scaled / rotated / faded.
 *   - Clicking a side slide selects it.
 *   - Clicking the center slide opens the lightbox.
 *   - Prev/next buttons + thumbnail strip jump to any slide.
 *   - Drag/swipe left/right navigates.
 *   - Keyboard arrows navigate when the section is focused.
 */
export function Gallery() {
  const lightbox = useLightbox(LIGHTBOX_ITEMS);
  const [selected, setSelected] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // ── Navigation helpers ──
  // Wrap around with modulo so the carousel loops.
  const goTo = useCallback((i: number) => {
    setSelected(((i % TOTAL) + TOTAL) % TOTAL);
  }, []);

  const goPrev = useCallback(() => setSelected((s) => (s - 1 + TOTAL) % TOTAL), []);
  const goNext = useCallback(() => setSelected((s) => (s + 1) % TOTAL), []);

  // ── Keyboard navigation ──
  // Listen globally when the gallery section is in the viewport.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Only handle arrows if the gallery is roughly in view
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
      if (!inView) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext]);

  // ── Drag / swipe support ──
  const dragStartX = useRef<number | null>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  }, []);
  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      if (delta > 0) goPrev();
      else goNext();
    }
    dragStartX.current = null;
  }, [goPrev, goNext]);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="relative bg-surface-container-lowest py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto max-w-3xl text-center">
          <SectionLabel>Gallery</SectionLabel>
          <SectionHeading>
            A glimpse of
            <span className="text-sage-gradient italic"> White Villa FarmHouse.</span>
          </SectionHeading>
          <p className="mt-6 text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Drag, click a side card to focus it, or pick a thumbnail below. Click
            the center photo to preview it full-screen.
          </p>
        </header>

        {/* ── 3D peek-stack carousel ── */}
        <div className="mt-16">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base text-tertiary">photo_library</span>
            <span className="font-sans text-[10px] uppercase tracking-luxe text-on-surface-variant">
              Image gallery · {TOTAL} photos of the estate
            </span>
          </div>

          {/*
            Carousel stage — relative container with a fixed height.
            All slides are absolutely positioned and transformed based on
            their distance from the selected index. The container has
            `perspective` so the rotateY on side slides pops out in 3D.
            `touch-action: pan-y` lets vertical scroll work on mobile while
            we capture horizontal drags.
          */}
          <div
            className="relative overflow-hidden py-10 select-none"
            style={{ perspective: "1400px", touchAction: "pan-y" }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { dragStartX.current = null; }}
          >
            <div
              className="relative mx-auto"
              style={{
                height: "min(70vh, 560px)",
                maxWidth: "min(90vw, 440px)",
                transformStyle: "preserve-3d",
              }}
            >
              {MEDIA.gallery.map((img, idx) => {
                // Shortest circular distance from selected to this slide
                let distance = idx - selected;
                // Wrap to [-TOTAL/2, TOTAL/2] for the shortest path
                if (distance > TOTAL / 2) distance -= TOTAL;
                if (distance < -TOTAL / 2) distance += TOTAL;

                const absDistance = Math.abs(distance);
                const isCenter = absDistance === 0;
                const isSide = absDistance === 1;

                // Visual properties based on distance
                const scale = isCenter ? 1 : isSide ? 0.78 : 0.6;
                const rotateY = distance === 0 ? 0 : distance > 0 ? -32 : 32;
                const translateX = distance * 55; // px — nudge side slides
                const translateZ = isCenter ? 0 : -140;
                const opacity = absDistance > 2 ? 0 : isCenter ? 1 : isSide ? 0.72 : 0.3;
                const zIndex = 20 - absDistance;
                const isVisible = absDistance <= 2;

                return (
                  <div
                    key={img.caption ?? `gallery-${idx}`}
                    className="absolute inset-0"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      opacity,
                      zIndex,
                      pointerEvents: isVisible ? "auto" : "none",
                      transition: "transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 500ms ease",
                    }}
                    aria-hidden={!isCenter}
                  >
                    {/* NOTE: outer element is a <div role="button"> (NOT a <button>)
                        because MediaSlot renders its own <button> when previewable,
                        and buttons can't be nested. */}
                    <div
                      role="button"
                      tabIndex={isCenter ? 0 : -1}
                      onClick={() => {
                        if (isCenter) {
                          lightbox.open(idx);
                        } else {
                          goTo(idx);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (isCenter) lightbox.open(idx);
                          else goTo(idx);
                        }
                      }}
                      className="relative block h-full w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                      aria-label={isCenter ? `Open photo ${idx + 1} full-screen` : `Focus photo ${idx + 1}`}
                    >
                      <figure className="group relative h-full w-full overflow-hidden rounded-3xl bg-surface-container-low border border-outline-variant elevation-3">
                        <MediaSlot
                          src={img.src}
                          alt={img.alt}
                          aspectClass="aspect-[4/5]"
                          previewable={isCenter}
                          onPreview={() => lightbox.open(idx)}
                          className="h-full w-full rounded-3xl"
                        />
                        {/* Dark gradient + caption — only on the centered slide */}
                        <figcaption
                          className={[
                            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent p-5 pt-12 transition-opacity duration-500",
                            isCenter ? "opacity-100" : "opacity-0",
                          ].join(" ")}
                        >
                          <span className="flex items-center gap-2 font-display text-base text-cream">
                            <Icon name="photo_camera" className="text-sm text-sage-soft" />
                            {img.caption}
                          </span>
                        </figcaption>
                        {/* Slide-number badge — top-left, only on centered slide */}
                        <span
                          className={[
                            "absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface-lowest/90 font-display text-sm text-primary backdrop-blur-sm ring-1 ring-sage/30 transition-opacity duration-500",
                            isCenter ? "opacity-100" : "opacity-0",
                          ].join(" ")}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </figure>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Prev / next controls — crystallized glass buttons */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                className="crystal-nav-btn flex h-14 w-14 items-center justify-center rounded-full"
                aria-label="Previous photo"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <span className="font-sans text-[11px] uppercase tracking-luxe text-on-surface-variant min-w-[60px] text-center">
                {String(selected + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={goNext}
                className="crystal-nav-btn flex h-14 w-14 items-center justify-center rounded-full"
                aria-label="Next photo"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>

          {/* ── Thumbnail strip pagination — single row with horizontal scroll ── */}
          <div className="mt-8">
            <div
              className="flex items-center gap-2 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory
                         [scrollbar-width:thin] [scrollbar-color:var(--sage)_var(--surface-dim)]
                         [&::-webkit-scrollbar]:h-1.5
                         [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-surface-dim
                         [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sage
                         [&::-webkit-scrollbar-thumb:hover]:bg-moss"
              role="listbox"
              aria-label="Gallery thumbnails — scroll horizontally to see all photos"
            >
              {MEDIA.gallery.map((img, idx) => (
                <button
                  key={`thumb-${idx}`}
                  type="button"
                  role="option"
                  onClick={() => goTo(idx)}
                  className={[
                    "relative h-16 w-16 shrink-0 snap-center overflow-hidden rounded-xl transition-all duration-300 state-layer",
                    idx === selected
                      ? "ring-2 ring-sage ring-offset-2 ring-offset-surface-container-lowest scale-105 elevation-1"
                      : "ring-1 ring-outline-variant opacity-60 hover:opacity-100 hover:ring-sage/50",
                  ].join(" ")}
                  aria-label={`Jump to photo ${idx + 1}`}
                  aria-current={idx === selected}
                >
                  <MediaSlot
                    src={img.src}
                    alt={img.alt}
                    aspectClass="aspect-square"
                    className="h-full w-full rounded-xl"
                  />
                </button>
              ))}
            </div>
            {/* Hint pill — centered, inline-block so it doesn't span full width */}
            <div className="mt-3 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage-soft/20 px-3 py-1 text-[10px] uppercase tracking-wide-luxe text-on-surface-variant/70">
                <span className="material-symbols-outlined text-xs text-sage">swap_horiz</span>
                Scroll thumbnails to see all {TOTAL} photos
                <span className="material-symbols-outlined text-xs text-sage">swap_horiz</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        items={lightbox.items}
        index={lightbox.index}
        onClose={lightbox.onClose}
        onNavigate={lightbox.onNavigate}
      />
    </section>
  );
}
