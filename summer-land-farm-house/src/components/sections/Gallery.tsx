"use client";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation, Autoplay, Keyboard, A11y } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { MediaSlot } from "@/components/ui/media-slot";
import { SectionHeading, SectionLabel } from "@/components/ui/luxury-primitives";
import { Lightbox, useLightbox, type LightboxItem } from "@/components/ui/lightbox";
import { MEDIA } from "@/data/media";

const LIGHTBOX_ITEMS: LightboxItem[] = MEDIA.gallery.map((g) => ({
  src: g.src,
  alt: g.alt,
  caption: g.caption,
}));

export function Gallery() {
  const lightbox = useLightbox(LIGHTBOX_ITEMS);
  const swiperRef = useRef<SwiperClass | null>(null);

  return (
    <section id="gallery" className="relative bg-surface-container-lowest py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto max-w-3xl text-center">
          <SectionLabel>Gallery</SectionLabel>
          <SectionHeading>
            A glimpse of
            <span className="text-moss-gradient italic"> D-Victoria Elite.</span>
          </SectionHeading>
          <p className="mt-6 text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Drag the slider or use the arrow keys to look around. Click any image to preview full-screen.
          </p>
        </header>

        {/* ── Estate image slider (Swiper Coverflow) ── */}
        <div className="mt-14">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base text-tertiary">photo_library</span>
            <span className="font-sans text-[10px] uppercase tracking-luxe text-on-surface-variant">
              Image gallery · {MEDIA.gallery.length} photos of the estate
            </span>
          </div>

          {/* Swiper wrapper — pagination is rendered as a separate element below */}
          <div className="relative">
            <Swiper
              modules={[EffectCoverflow, Pagination, Navigation, Autoplay, Keyboard, A11y]}
              effect="coverflow"
              grabCursor
              centeredSlides
              slidesPerView="auto"
              loop={MEDIA.gallery.length > 5}
              keyboard={{ enabled: true }}
              autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 180,
                modifier: 2.5,
                slideShadows: false,
              }}
              pagination={{
                el: "#gallery-pagination",
                clickable: true,
                type: "bullets",
              }}
              navigation
              a11y={{
                prevSlideMessage: "Previous photo",
                nextSlideMessage: "Next photo",
                firstSlideMessage: "This is the first photo",
                lastSlideMessage: "This is the last photo",
                paginationBulletMessage: "Go to photo {{index}}",
              }}
              onSwiper={(s) => (swiperRef.current = s)}
              style={
                {
                  "--swiper-navigation-size": "32px",
                } as React.CSSProperties
              }
            >
              {MEDIA.gallery.map((img, idx) => (
                <SwiperSlide
                  key={img.caption ?? `gallery-${idx}`}
                  style={{ width: "min(380px, 80vw)" }}
                >
                  <figure className="group relative overflow-hidden rounded-3xl bg-surface-container-low elevation-2">
                    <MediaSlot
                      src={img.src}
                      alt={img.alt}
                      aspectClass="aspect-[4/5]"
                      previewable
                      onPreview={() => lightbox.open(idx)}
                      className="rounded-3xl"
                    />
                    <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent p-5 pt-12">
                      <span className="font-display text-base text-cream">{img.caption}</span>
                    </figcaption>
                  </figure>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom external pagination — sits below the swiper, never overlaps */}
            <div
              id="gallery-pagination"
              className="mt-8 flex items-center justify-center gap-2"
              aria-label="Gallery pagination"
            />
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
