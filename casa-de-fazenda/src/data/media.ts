/**
 * Centralized media registry for The Green Valley.
 * All local images use STATIC IMPORTS so next/image auto-fills width/height/blurDataURL.
 */
import heroCover from "../../public/images/hero-cover.jpeg";
// import logo from "../../public/images/logo.jpg";
import swimmingPool from "../../public/images/swimming-pool.jpg";
import park from "../../public/images/park.jpg";
import kidPlaying from "../../public/images/kid-playing.jpg";
import sportsRoom from "../../public/images/playground.jpg";
import gamingRoom from "../../public/images/sports-room.jpg";
import slider1 from "../../public/images/slider-1.jpg";
import slider2 from "../../public/images/slider-2.jpg";
import slider3 from "../../public/images/slider-3.jpg";
import slider4 from "../../public/images/slider-4.jpg";
import slider5 from "../../public/images/slider-5.jpg";
import slider6 from "../../public/images/slider-6.jpg";
import slider8 from "../../public/images/slider-8.jpg";
import slider9 from "../../public/images/slider-9.jpg";
import slider10 from "../../public/images/slider-10.jpg";
import slider11 from "../../public/images/slider-11.jpg";

function getFarmhousePhone(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_PHONE) return process.env.NEXT_PUBLIC_FARMHOUSE_PHONE;
  return "+92 315 2902811";
}
function getFarmhouseEmail(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_EMAIL) return process.env.NEXT_PUBLIC_FARMHOUSE_EMAIL;
  return "hello@thegreenvalley.pk";
}
function getFarmhouseAddress(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_ADDRESS) return process.env.NEXT_PUBLIC_FARMHOUSE_ADDRESS;
  return "Survey 3 & 4 Deh Kharkharo, NS Residency Sub Division Murad Memon, Karachi, Gadap Town, 75530";
}

const phone = getFarmhousePhone();
const email = getFarmhouseEmail();
const address = getFarmhouseAddress();

export const FARMHOUSE = {
  name: "The Green Valley",
  phone,
  phoneHref: `tel:${phone}`,
  email,
  emailHref: `mailto:${email}`,
  address,
  // Google Maps — uses the resolved Place ID from the owner's short link.
  //
  // The owner's link (maps.app.goo.gl/RRw8GfJNqXsie17f8) resolves to a
  // real Google Place:
  //   Name: The Green Valley Farmhouse
  //   Place ID: 0x3eb3377883184a59:0xd4e6da7e2f70cfd7
  //   Coordinates: 24.958571799999998, 67.2571822
  //
  // Using the Place ID in the embed query makes Google drop a labelled
  // marker with the business name. Clicking the marker opens the full
  // info card (name, address, directions, etc.) — no "couldn't load" error.
  mapsEmbed:
    "https://maps.google.com/maps?q=The+Green+Valley+Farmhouse,+Karachi&z=15&output=embed",
  // Owner-provided Google Maps share link — opens the exact place.
  mapsLink: "https://maps.app.goo.gl/RRw8GfJNqXsie17f8?g_st=aw",
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
  },
  estate: { pool: swimmingPool, park: park, pavilion: slider6 },
  facilities: { kids: kidPlaying, gaming: gamingRoom, sports: sportsRoom },
  gallery: [
    { src: slider1, alt: "The Green Valley — exterior view", caption: "The estate · exterior" },
    { src: slider2, alt: "The Green Valley — garden perspective", caption: "Garden · perspective" },
    { src: slider3, alt: "The Green Valley — interior pavilion", caption: "Pavilion · interior" },
    { src: slider6, alt: "The Green Valley — air-conditioned glass pavilion", caption: "Glass pavilion · AC" },
    { src: slider8, alt: "The Green Valley — grounds at golden hour", caption: "Grounds · golden hour" },
    { src: slider9, alt: "The Green Valley — evening ambiance", caption: "Evening · ambiance" },
    { src: slider10, alt: "The Green Valley — quiet corner of the estate", caption: "Quiet corner · estate" },
    { src: slider11, alt: "The Green Valley — landscape detail", caption: "Landscape · detail" },
  ],
  videos: [
    { label: "The Green Valley walk-through · exterior + grounds", src: undefined as string | undefined, poster: slider1 },
    { label: "Sunrise over the estate", src: undefined as string | undefined, poster: slider8 },
    { label: "Evening on the deck", src: undefined as string | undefined, poster: slider9 },
  ],
} as const;

export type GalleryImage = (typeof MEDIA.gallery)[number];
