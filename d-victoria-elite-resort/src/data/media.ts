/**
 * Centralized media registry for D-Victoria Elite.
 * All local images use STATIC IMPORTS so next/image auto-fills width/height/blurDataURL.
 */
import heroCover from "../../public/images/hero-cover.jpg";
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
  return "hello@countryfarm.pk";
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
  mapsEmbed: "https://www.google.com/maps?q=Gadap+Town+Karachi&output=embed&z=16",
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
  hero: { cover: heroCover, poster: heroCover, videoSrc: undefined as string | undefined },
  estate: { pool: swimmingPool, park: park, pavilion: slider6 },
  facilities: { kids: kidPlaying, gaming: sportsRoom, sports: park },
  gallery: [
    { src: slider1, alt: "Country Farm — exterior view", caption: "The estate · exterior" },
    { src: slider2, alt: "Country Farm — garden perspective", caption: "Garden · perspective" },
    { src: slider3, alt: "Country Farm — interior pavilion", caption: "Pavilion · interior" },
    { src: slider6, alt: "Country Farm — air-conditioned glass pavilion", caption: "Glass pavilion · AC" },
    { src: slider8, alt: "Country Farm — grounds at golden hour", caption: "Grounds · golden hour" },
    { src: slider9, alt: "Country Farm — evening ambiance", caption: "Evening · ambiance" },
    { src: slider10, alt: "Country Farm — quiet corner of the estate", caption: "Quiet corner · estate" },
    { src: slider11, alt: "Country Farm — landscape detail", caption: "Landscape · detail" },
  ],
  videos: [
    { label: "Farmhouse walk-through · exterior + grounds", src: undefined as string | undefined, poster: slider1 },
    { label: "Sunrise over the estate", src: undefined as string | undefined, poster: slider8 },
    { label: "Evening on the deck", src: undefined as string | undefined, poster: slider9 },
  ],
} as const;

export type GalleryImage = (typeof MEDIA.gallery)[number];
