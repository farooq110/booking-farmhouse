/**
 * Centralized media registry for White Villa FarmHouse.
 * All local images use STATIC IMPORTS so next/image auto-fills width/height/blurDataURL.
 */
import heroCover from "../../public/images/hero-cover.webp";
import swimmingPool from "../../public/images/swimming-pool.webp";
import park from "../../public/images/park.webp";
import bedRoom from "../../public/images/bed-room.webp";
// import kidPlaying from "../../public/images/kid-playing.webp";
import sportsRoom from "../../public/images/sports-room.webp";
import playground from "../../public/images/playground.webp";
import slider1 from "../../public/images/slider-1.webp";
import slider2 from "../../public/images/slider-2.webp";
import slider3 from "../../public/images/slider-3.webp";
import slider4 from "../../public/images/slider-4.webp";
import slider5 from "../../public/images/slider-5.webp";
import slider6 from "../../public/images/slider-6.webp";
import slider8 from "../../public/images/slider-8.jpeg";
import slider9 from "../../public/images/slider-9.webp";
import slider10 from "../../public/images/slider-10.webp";
// import slider11 from "../../public/images/slider-11.png";
import dinningArea from "../../public/images/dinning-area.webp";


function getFarmhousePhone(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_PHONE) return process.env.NEXT_PUBLIC_FARMHOUSE_PHONE;
  return "+92 3400857419";
}
function getFarmhouseEmail(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_EMAIL) return process.env.NEXT_PUBLIC_FARMHOUSE_EMAIL;
  return "aljannat2021@gmail.com";
}
function getFarmhouseAddress(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_ADDRESS) return process.env.NEXT_PUBLIC_FARMHOUSE_ADDRESS;
  return "White Villa FarmHouse, Taiser Town, Karachi";
}

const phone = getFarmhousePhone();
const email = getFarmhouseEmail();
const address = getFarmhouseAddress();

export const FARMHOUSE = {
  name: "White Villa FarmHouse",
  tagline: "A Private Eco Retreat",
  phone,
  phoneHref: `tel:${phone}`,
  email,
  emailHref: `mailto:${email}`,
  address,
  // Google Maps — owner-provided share link resolves to the exact place.
  //
  //   Link: https://maps.app.goo.gl/JRCHVa3ykLshTECt8?g_st=aw
  //   Name: White Villa FarmHouse (Taiser Town, Karachi)
  //
  // The embed query uses the business name + city so Google drops a
  // labelled marker on the map.
  mapsEmbed:
    "https://maps.google.com/maps?q=White+Villa+FarmHouse,+Taiser+Town,+Karachi&z=15&output=embed",
  // Owner-provided Google Maps share link — opens the exact place.
  mapsLink: "https://maps.app.goo.gl/JRCHVa3ykLshTECt8?g_st=aw",
} as const;

function getApiBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  return "";
}
function getDefaultServiceId(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DEFAULT_SERVICE_ID) return process.env.NEXT_PUBLIC_DEFAULT_SERVICE_ID;
  return "";
}

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  defaultServiceId: getDefaultServiceId(),
  useMockData: false,
} as const;

export const MEDIA = {
  logo:undefined as string | undefined,
  hero: {
    cover: heroCover,
    poster: heroCover,
    videoSrc: "/videos/hero-cover.mp4",
    videoFallbackSrc: "/videos/hero-cover.mp4",
    // ── Hero image slider ──
    // 4 distinct images cycled with a random transition effect each
    // step (fade, slide, zoom-pan, reveal). See <HeroBackgroundSlider>.
    slides: [
      { src: heroCover, alt: "White Villa FarmHouse — golden hour over the estate" },
      { src: slider1, alt: "White Villa FarmHouse — exterior facade at dusk" },
      { src: slider8, alt: "White Villa FarmHouse — grounds at sunset" },
      { src: slider9, alt: "White Villa FarmHouse — evening ambiance on the deck" },
    ],
  },
  estate: { pool: swimmingPool, park: park, pavilion: bedRoom },
  facilities: {
    barbiQArea: dinningArea,
    // kids: kidPlaying,
    gaming: playground, sports: sportsRoom },
  gallery: [
    { src: slider1, alt: "White Villa FarmHouse — exterior view", caption: "The estate · exterior" },
    { src: slider2, alt: "White Villa FarmHouse — garden perspective", caption: "Garden · perspective" },
    { src: slider3, alt: "White Villa FarmHouse — interior pavilion", caption: "Pavilion · interior" },
    { src: slider6, alt: "White Villa FarmHouse — air-conditioned glass pavilion", caption: "Glass pavilion · AC" },
    { src: slider8, alt: "White Villa FarmHouse — grounds at golden hour", caption: "Grounds · golden hour" },
    { src: slider9, alt: "White Villa FarmHouse — evening ambiance", caption: "Evening · ambiance" },
    { src: slider10, alt: "White Villa FarmHouse — quiet corner of the estate", caption: "Quiet corner · estate" },
    { src: slider5, alt: "White Villa FarmHouse — landscape detail", caption: "Landscape · detail" },
  ],
  videos: [
    { label: "White Villa FarmHouse walk-through · exterior + grounds", src: undefined as string | undefined, poster: slider1 },
    { label: "Sunrise over the estate", src: undefined as string | undefined, poster: slider8 },
    { label: "Evening on the deck", src: undefined as string | undefined, poster: slider9 },
  ],
} as const;

export type GalleryImage = (typeof MEDIA.gallery)[number];
