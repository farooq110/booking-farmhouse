"use client";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCreative, Pagination, Navigation, Autoplay, Keyboard, A11y } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { VideoSlot } from "@/components/ui/video-slot";
import { SectionHeading, SectionLabel, Icon } from "@/components/ui/luxury-primitives";
import { MEDIA } from "@/data/media";

/**
 * VideoGallery — Cinematic Tours slider (Swiper EffectCreative).
 *
 * Effect choice rationale:
 *   - Gallery already uses a custom peek-stack 3D carousel (Embla-free).
 *   - The original Casa De Fazenda Gallery used Coverflow.
 *   - For Cinematic Tours, EffectCreative gives a unique "deck slide"
 *     feel: the active slide stays put while the next slide slides in
 *     from the right with a slight rotate + opacity fade, and the
 *     previous slide peeks behind with a depth translate. This is
 *     distinct from both the Gallery's peek-stack AND from Coverflow.
 *
 * Each slide keeps the Estate-style card design (poster + content side
 * by side on desktop, stacked on mobile) so the section still matches
 * the Estate visually while gaining motion.
 *
 * Navigation:
 *   - Crystallized sage glass prev/next buttons (styled in globals.css
 *     via .swiper-button-prev/next — same look as the rest of the
 *     theme's slider nav).
 *   - Sage pill pagination below.
 *   - Keyboard arrows + drag/swipe + autoplay (6s, pauses on hover).
 */
export function VideoGallery() {
  const swiperRef = useRef<SwiperClass | null>(null);

  return (
    <section
      id="videos"
      className="relative bg-gradient-to-b from-surface-container-lowest to-surface-container-low py-20 sm:py-28 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mx-auto max-w-3xl text-center">
          <SectionLabel>Cinematic Tours</SectionLabel>
          <SectionHeading>
            Short films from
            <span className="text-sage-gradient italic"> the estate.</span>
          </SectionHeading>
          <p className="mt-6 text-base sm:text-lg text-on-surface-variant text-pretty leading-relaxed">
            Hand-shot walk-throughs of the grounds, the pavilions, and the
            golden-hour light. Use the arrows or swipe to explore.
          </p>
        </header>

        <div className="mt-14">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base text-tertiary">movie</span>
            <span className="font-sans text-[10px] uppercase tracking-luxe text-on-surface-variant">
              Video tours · {MEDIA.videos.length} films
            </span>
          </div>

          {/* Swiper wrapper — pagination rendered as a separate element below */}
          <div className="relative">
            <Swiper
              modules={[EffectCreative, Pagination, Navigation, Autoplay, Keyboard, A11y]}
              effect="creative"
              grabCursor
              slidesPerView={1}
              loop={MEDIA.videos.length > 2}
              keyboard={{ enabled: true }}
              autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              creativeEffect={{
                // Active slide: stays in place, full opacity
                prev: {
                  translate: ["-18%", 0, -200],
                  opacity: 0,
                  origin: "center center",
                },
                // Next slide: slides in from the right with depth + slight rotate
                next: {
                  translate: ["100%", 0, 0],
                },
              }}
              pagination={{
                el: "#videos-pagination",
                clickable: true,
                type: "bullets",
              }}
              navigation
              a11y={{
                prevSlideMessage: "Previous film",
                nextSlideMessage: "Next film",
                firstSlideMessage: "This is the first film",
                lastSlideMessage: "This is the last film",
                paginationBulletMessage: "Go to film {{index}}",
              }}
              onSwiper={(s) => (swiperRef.current = s)}
              style={
                {
                  "--swiper-navigation-size": "24px",
                } as React.CSSProperties
              }
            >
              {MEDIA.videos.map((v, i) => (
                <SwiperSlide key={v.label}>
                  {/* Estate-style horizontal magazine card inside each slide */}
                  <article className="group relative grid grid-cols-1 overflow-hidden rounded-[1.5rem] border border-outline-variant bg-surface-lowest transition-all duration-500 hover:border-sage hover:elevation-3 elevation-1 md:grid-cols-[1.1fr_1fr]">
                    {/* ── Poster side ── */}
                    <div className="relative overflow-hidden md:order-1">
                      <div className="relative h-64 sm:h-80 md:h-[460px]">
                        <VideoSlot
                          src={v.src}
                          poster={v.poster}
                          showPlayHint={!!v.src}
                          className="h-full w-full rounded-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        />
                      </div>

                      {/* Large offset numeral in top-left of poster */}
                      <div className="pointer-events-none absolute left-0 top-0 flex items-end gap-2 p-4 sm:p-5">
                        <div className="relative">
                          {/* Sage accent bar behind the numeral */}
                          <span className="absolute -bottom-1 -left-1 h-3 w-full bg-sage/40 rounded-sm" aria-hidden="true" />
                          <span className="relative font-display text-5xl sm:text-6xl font-bold text-cream leading-none drop-shadow-lg">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </div>

                      {/* Bottom gradient + play icon pill — overlay on poster */}
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-charcoal/70 to-transparent p-4 sm:p-5">
                        <span className="flex items-center gap-2 rounded-full bg-surface-lowest/90 px-3 py-1.5 backdrop-blur-sm elevation-1">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                          </span>
                          <span className="font-sans text-[10px] uppercase tracking-luxe text-primary">
                            Cinematic
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* ── Content side ── */}
                    <div className="relative flex flex-col justify-center p-6 sm:p-8 md:p-10 md:order-2">
                      {/* Sage corner accent in the top-right — matches Estate */}
                      <span
                        className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-[3rem] bg-sage-soft/35"
                        aria-hidden="true"
                      />

                      <h3 className="font-display text-2xl sm:text-3xl text-on-surface">
                        {v.label}
                      </h3>
                      <p className="mt-3 text-sm sm:text-base text-on-surface-variant leading-relaxed">
                        A short, hand-shot film from the estate. Tap the poster
                        to play the full tour, or read on for what to expect.
                      </p>

                      {/* Inline chips — runtime + status — matches Estate's highlight chips */}
                      <ul className="mt-5 flex flex-wrap gap-2">
                        <li className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm text-sage">
                            schedule
                          </span>
                          ~60 s
                        </li>
                        <li className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm text-sage">
                            videocam
                          </span>
                          4K · hand-shot
                        </li>
                        {v.src ? (
                          <li className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm text-sage">
                              play_circle
                            </span>
                            Ready to play
                          </li>
                        ) : (
                          <li className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm text-sage">
                              upcoming
                            </span>
                            Coming soon
                          </li>
                        )}
                      </ul>

                      {/* "Watch film" arrow — reveals on hover, matches Estate's "Discover →" */}
                      <div className="mt-6 flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="h-px w-8 bg-sage" />
                        <span>Watch film</span>
                        <span className="material-symbols-outlined text-base text-sage">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom external pagination — sits below the swiper, never overlaps */}
            <div
              id="videos-pagination"
              className="mt-8 flex items-center justify-center gap-2"
              aria-label="Video gallery pagination"
            />
          </div>

          <p className="mt-6 text-center text-xs text-on-surface-variant/80">
            More films on the way — we shoot a new one each season. Ask us
            about specific views when you enquire.
          </p>
        </div>
      </div>
    </section>
  );
}
