"use client";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay, Keyboard, A11y } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { VideoSlot } from "@/components/ui/video-slot";
import { SectionHeading, SectionLabel, Icon } from "@/components/ui/luxury-primitives";
import { MEDIA } from "@/data/media";

/**
 * VideoGallery — a dedicated section with its own Swiper slider for
 * cinematic video tours of the estate. Each slide is a 16/9 video card
 * with a poster image and play-button hint.
 *
 * Without video files (.mp4), the slot falls back to the poster image
 * with a play-button overlay so the slider always feels alive in dev.
 * Drop your hosted .mp4 URLs into MEDIA.videos[].src to enable playback.
 */
export function VideoGallery() {
  const swiperRef = useRef<SwiperClass | null>(null);

  return (
    <section
      id="videos"
      className="relative bg-gradient-to-b from-surface-container-lowest to-surface-container-low py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto max-w-3xl text-center">
          <SectionLabel>Cinematic Tours</SectionLabel>
          <SectionHeading>
            Short films from
            <span className="text-moss-gradient italic"> the estate.</span>
          </SectionHeading>
          <p className="mt-6 text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Swipe or use the arrows to explore. Videos will play once .mp4 files are hosted.
          </p>
        </header>

        <div className="mt-14">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base text-tertiary">movie</span>
            <span className="font-sans text-[10px] uppercase tracking-luxe text-on-surface-variant">
              Video tours · {MEDIA.videos.length} films
            </span>
          </div>

          {/* Swiper wrapper — pagination is rendered as a separate element below */}
          <div className="relative">
            <Swiper
              modules={[Pagination, Navigation, Autoplay, Keyboard, A11y]}
              grabCursor
              slidesPerView={1}
              spaceBetween={24}
              loop={MEDIA.videos.length > 3}
              keyboard={{ enabled: true }}
              autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
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
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 24 },
                768: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
              }}
              style={
                {
                  "--swiper-navigation-size": "32px",
                } as React.CSSProperties
              }
            >
              {MEDIA.videos.map((v) => (
                <SwiperSlide key={v.label}>
                  <figure className="group relative overflow-hidden rounded-3xl bg-surface-container-low elevation-2">
                    <VideoSlot
                      src={v.src}
                      poster={v.poster}
                      showPlayHint={!!v.src}
                      className="aspect-video h-full w-full rounded-3xl"
                    />
                    <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent p-5 pt-12">
                      <span className="flex items-center gap-2 font-display text-base text-cream">
                        <Icon name="play_circle" className="text-base text-amber-soft" />
                        {v.label}
                      </span>
                    </figcaption>
                  </figure>
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
