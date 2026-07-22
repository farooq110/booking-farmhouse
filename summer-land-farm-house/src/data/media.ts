/**
 * Centralized media registry for D-Victoria Elite.
 * All local images use STATIC IMPORTS so next/image auto-fills width/height/blurDataURL.
 */
import heroCover from "../../public/images/hero-cover.jpg";
import logo from "../../public/images/logo.jpeg";
import swimmingPool from "../../public/images/swimming-pool.jpg";
import park from "../../public/images/park.jpg";
import kidPlaying from "../../public/images/kid-playing.jpg";
import sportsRoom from "../../public/images/sports-room.jpeg";
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
  return "+92 3373523503";
}
function getFarmhouseEmail(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_EMAIL) return process.env.NEXT_PUBLIC_FARMHOUSE_EMAIL;
  return "hello@dvictoriaelite.pk";
}
function getFarmhouseAddress(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_ADDRESS) return process.env.NEXT_PUBLIC_FARMHOUSE_ADDRESS;
  return "Gadap Town, Karachi";
}

const phone = getFarmhousePhone();
const email = getFarmhouseEmail();
const address = getFarmhouseAddress();

export const FARMHOUSE = {
  name: "D-Victoria Elite",
  phone,
  phoneHref: `tel:${phone}`,
  email,
  emailHref: `mailto:${email}`,
  address,
  // Google Maps embed that drops a labelled marker at the resort AND
  // resolves to the place's info card when the user clicks it.
  //
  // IMPORTANT: using raw lat,lng in `q=` makes Google show a generic
  // pin with no place context — clicking it raises "Place info
  // couldn't load". Using the PLACE NAME lets Google resolve it to a
  // real Place ID, so the marker click opens the full info card
  // (reviews, ratings, directions, "Open in Maps").
  //
  // Coordinates resolved from the owner's maps.app.goo.gl share link:
  //   25.0040625, 67.2174375
  mapsEmbed:
    "https://www.google.com/maps?q=D-Victoria+Elite+Resorts,+Gadap+Town,+Karachi&z=15&output=embed",
  // Public shareable link — exact URL requested by the owner.
  mapsLink: "https://maps.app.goo.gl/uvZTd8NFHdcCVhPw8?g_st=aw",
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
  logo,
  hero: {
    cover: heroCover,
    poster: heroCover,
    // Primary hero background video — 540×960 portrait, FULL CONTENT
    // (no cropping). The original portrait video is downscaled for size
    // but kept at its natural 9:16 aspect ratio so nothing is cut off.
    //
    // Display strategy (see BackgroundVideo component):
    //   The portrait video is displayed centered on screen at its
    //   natural aspect ratio. The empty space on the sides (which would
    //   otherwise be black bars) is filled with a blurred, scaled-up
    //   copy of the same video — the "cinematic blurred background
    //   fill" pattern used by Instagram/YouTube for vertical video on
    //   horizontal screens. No content is cropped.
    //
    // Streaming:
    //   - Served by a Service Worker that handles HTTP Range requests
    //     (see /public/sw.js). Browser only pulls bytes ahead of the
    //     playhead, no Blob assembly.
    videoSrc: "/videos/hero-cover-portrait.mp4",
    // Original portrait MP4 kept as a fallback if the optimized version
    // ever fails to load (e.g. SW not yet registered on first paint).
    videoFallbackSrc: "/videos/hero-cover-portrait.mp4",
  },
  estate: { pool: swimmingPool, park: park, pavilion: slider6 },
  facilities: { kids: kidPlaying, gaming: sportsRoom, sports: park },
  gallery: [
    { src: slider1, alt: "D-Victoria Elite — exterior view", caption: "The estate · exterior" },
    { src: slider2, alt: "D-Victoria Elite — garden perspective", caption: "Garden · perspective" },
    { src: slider3, alt: "D-Victoria Elite — interior pavilion", caption: "Pavilion · interior" },
    { src: slider6, alt: "D-Victoria Elite — air-conditioned glass pavilion", caption: "Glass pavilion · AC" },
    { src: slider8, alt: "D-Victoria Elite — grounds at golden hour", caption: "Grounds · golden hour" },
    { src: slider9, alt: "D-Victoria Elite — evening ambiance", caption: "Evening · ambiance" },
    { src: slider10, alt: "D-Victoria Elite — quiet corner of the estate", caption: "Quiet corner · estate" },
    { src: slider11, alt: "D-Victoria Elite — landscape detail", caption: "Landscape · detail" },
  ],
  videos: [
    { label: "D-Victoria Elite walk-through · exterior + grounds", src: undefined as string | undefined, poster: slider1 },
    { label: "Sunrise over the estate", src: undefined as string | undefined, poster: slider8 },
    { label: "Evening on the deck", src: undefined as string | undefined, poster: slider9 },
  ],
} as const;

export type GalleryImage = (typeof MEDIA.gallery)[number];
