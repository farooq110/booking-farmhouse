/**
 * Centralized media registry for Country Farm.
 *
 * Every image and video URL used in the marketing site lives here. To swap
 * an asset, change one line. Images are served from /public/images/ (Next.js).
 */

function getFarmhousePhone(): string {
  // Next.js: process.env.NEXT_PUBLIC_FARMHOUSE_PHONE
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_PHONE) {
    return process.env.NEXT_PUBLIC_FARMHOUSE_PHONE;
  }
  return "+9203111227717"; // fallback
}

function getFarmhouseEmail(): string {
  // Next.js: process.env.NEXT_PUBLIC_FARMHOUSE_EMAIL
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_EMAIL) {
    return process.env.NEXT_PUBLIC_FARMHOUSE_EMAIL;
  }
  return "hello@countryfarm.pk"; // fallback
}

function getFarmhouseAddress(): string {
  // Next.js: process.env.NEXT_PUBLIC_FARMHOUSE_ADDRESS
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FARMHOUSE_ADDRESS) {
    return process.env.NEXT_PUBLIC_FARMHOUSE_ADDRESS;
  }
  return "7, 8 Deh Mehran, near Malir Cantt Check Post No 3, Malir Cantonment, Karachi, 75070, Pakistan"; // fallback
}

const phone = getFarmhousePhone();
const email = getFarmhouseEmail();
const address = getFarmhouseAddress();

export const FARMHOUSE = {
  name: "Country Farm",
  phone,
  phoneHref: `tel:${phone}`,
  email,
  emailHref: `mailto:${email}`,
  address,
  // Google Maps embed URL (no API key required — uses the public embed endpoint)
  mapsEmbed:
    "https://www.google.com/maps?q=Malir%20Cantt%20Check%20Post%20No%203%2C%20Karachi%2C%20Pakistan&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Malir+Cantt+Check+Post+No+3+Karachi+Pakistan",
} as const;

/**
 * Booking API configuration.
 *
 * The API base URL can be overridden via NEXT_PUBLIC_API_BASE_URL.
 * Defaults to production API for live deployments.
 *
 * serviceId is the default service offered at Country Farm. Must be the
 * MongoDB ObjectId (_id) returned by your backend when you create the service.
 * Override via NEXT_PUBLIC_DEFAULT_SERVICE_ID.
 */
function getApiBaseUrl(): string {
  // Next.js: process.env.NEXT_PUBLIC_API_BASE_URL (inlined at build time)
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return ""; // Must be set via NEXT_PUBLIC_API_BASE_URL env variable
}

function getDefaultServiceId(): string {
  // Next.js: process.env.NEXT_PUBLIC_DEFAULT_SERVICE_ID
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DEFAULT_SERVICE_ID) {
    return process.env.NEXT_PUBLIC_DEFAULT_SERVICE_ID;
  }
  return ""; // No safe default — must be set in env or passed explicitly
}

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  defaultServiceId: getDefaultServiceId(),
  /**
   * When true, the API client skips all network requests and returns
   * realistic dummy data instead. Useful for:
   *  - Demos without a backend
   *  - Local development when the API isn't running
   *  - Preview deployments where the API isn't reachable
   *
   * Set to false for production with real backend.
   */
  useMockData: false,
} as const;

export const MEDIA = {
  hero: {
    cover: "/images/hero-cover.jpg",
    poster: "/images/hero-cover.jpg",
    videoSrc: undefined as string | undefined,
  },
  estate: {
    pool: "/images/swimming-pool.jpg",
    park: "/images/park.jpg",
    pavilion: "/images/slider-6.jpg",
  },
  facilities: {
    kids: "/images/kid-playing.jpg",
    gaming: "/images/sports-room.jpg",
    sports: "/images/park.jpg",
  },
  gallery: [
    {
      src: "/images/slider-1.jpg",
      alt: "Country Farm — exterior view",
      caption: "The estate · exterior",
    },
    {
      src: "/images/slider-2.jpg",
      alt: "Country Farm — garden perspective",
      caption: "Garden · perspective",
    },
    {
      src: "/images/slider-3.jpg",
      alt: "Country Farm — interior pavilion",
      caption: "Pavilion · interior",
    },
    {
      src: "/images/slider-6.jpg",
      alt: "Country Farm — air-conditioned glass pavilion",
      caption: "Glass pavilion · AC",
    },
    {
      src: "/images/slider-8.jpg",
      alt: "Country Farm — grounds at golden hour",
      caption: "Grounds · golden hour",
    },
    {
      src: "/images/slider-9.jpg",
      alt: "Country Farm — evening ambiance",
      caption: "Evening · ambiance",
    },
    {
      src: "/images/slider-10.jpg",
      alt: "Country Farm — quiet corner of the estate",
      caption: "Quiet corner · estate",
    },
    {
      src: "/images/slider-11.jpg",
      alt: "Country Farm — landscape detail",
      caption: "Landscape · detail",
    },
  ],
  videos: [
    {
      label: "Farmhouse walk-through · exterior + grounds",
      src: undefined as string | undefined,
      poster: "/images/slider-1.jpg",
    },
    {
      label: "Sunrise over the estate",
      src: undefined as string | undefined,
      poster: "/images/slider-8.jpg",
    },
    {
      label: "Evening on the deck",
      src: undefined as string | undefined,
      poster: "/images/slider-9.jpg",
    },
  ],
} as const;

export type GalleryImage = (typeof MEDIA.gallery)[number];
