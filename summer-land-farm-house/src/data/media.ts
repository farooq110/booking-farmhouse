/**
 * Centralized media registry for Summer Land Farm House.
 * All local images use STATIC IMPORTS so next/image auto-fills width/height/blurDataURL.
 */
import heroCover from "../../public/images/hero-cover.jpeg";
import logo from "../../public/images/logo.jpg";
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
  return "+92 3152559431";
}
function getFarmhouseEmail(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_EMAIL) return process.env.NEXT_PUBLIC_FARMHOUSE_EMAIL;
  return "hello@summerlandfarmhouse.pk";
}
function getFarmhouseAddress(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_ADDRESS) return process.env.NEXT_PUBLIC_FARMHOUSE_ADDRESS;
  return "Land no. 86, Al Jannat Village, near Cosy water park, Gadap Town, Karachi";
}

const phone = getFarmhousePhone();
const email = getFarmhouseEmail();
const address = getFarmhouseAddress();

export const FARMHOUSE = {
  name: "Summer Land Farm House",
  phone,
  phoneHref: `tel:${phone}`,
  email,
  emailHref: `mailto:${email}`,
  address,
  // Google Maps embed — drops a labelled pin with "Summer Land Farm House"
  // and OPENS THE INFO WINDOW BY DEFAULT (no click required).
  //
  // The `iwloc=A` parameter tells Google to show the info window for the
  // first result automatically when the map loads. The user sees the
  // farmhouse name + address immediately without needing to click the pin.
  mapsEmbed:
    "https://maps.google.com/maps?q=Summer+Land+Farm+House+Al+Jannat+Village+Gadap+Town+Karachi&t=&z=15&ie=UTF8&iwloc=A&output=embed",
  // Public shareable link — opens Google Maps search for the farmhouse.
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Summer+Land+Farm+House+Al+Jannat+Village+Gadap+Town+Karachi",
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
    videoSrc: "/videos/hero-cover.mp4",
    videoFallbackSrc: "/videos/hero-cover.mp4",
  },
  estate: { pool: swimmingPool, park: park, pavilion: slider6 },
  facilities: { kids: kidPlaying, gaming: gamingRoom, sports: sportsRoom },
  gallery: [
    { src: slider1, alt: "Summer Land Farm House — exterior view", caption: "The estate · exterior" },
    { src: slider2, alt: "Summer Land Farm House — garden perspective", caption: "Garden · perspective" },
    { src: slider3, alt: "Summer Land Farm House — interior pavilion", caption: "Pavilion · interior" },
    { src: slider6, alt: "Summer Land Farm House — air-conditioned glass pavilion", caption: "Glass pavilion · AC" },
    { src: slider8, alt: "Summer Land Farm House — grounds at golden hour", caption: "Grounds · golden hour" },
    { src: slider9, alt: "Summer Land Farm House — evening ambiance", caption: "Evening · ambiance" },
    { src: slider10, alt: "Summer Land Farm House — quiet corner of the estate", caption: "Quiet corner · estate" },
    { src: slider11, alt: "Summer Land Farm House — landscape detail", caption: "Landscape · detail" },
  ],
  videos: [
    { label: "Summer Land Farm House walk-through · exterior + grounds", src: undefined as string | undefined, poster: slider1 },
    { label: "Sunrise over the estate", src: undefined as string | undefined, poster: slider8 },
    { label: "Evening on the deck", src: undefined as string | undefined, poster: slider9 },
  ],
} as const;

export type GalleryImage = (typeof MEDIA.gallery)[number];
