import type { Metadata, Viewport } from "next"
import { Barlow_Condensed, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow-condensed",
  display: "swap",
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: "#080c0a",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: "Elixir Arena | Premium Indoor Cricket Ground",
  description:
    "Reclaim your match day. Walk onto our professional, full-length 22-yard synthetic pitch lit by high-intensity sports floodlights in Karachi. Book your slot online instantly.",
  keywords: [
    "indoor cricket",
    "cricket arena",
    "cricket booking",
    "synthetic pitch",
    "karachi cricket pitch",
    "elixir arena",
    "floodlit arena",
  ],
  authors: [{ name: "Elixir Arena" }],
  openGraph: {
    title: "Elixir Arena | Premium Indoor Cricket Ground",
    description:
      "Reclaim your match day. Professional 22-yard synthetic pitch, high-intensity floodlights, and instant online booking.",
    url: "https://elixirarena.com",
    siteName: "Elixir Arena",
    images: [
      {
        url: "/arena-image-1.jpg",
        width: 1200,
        height: 630,
        alt: "Elixir Arena Indoor Cricket Pitch",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elixir Arena | Premium Indoor Cricket Ground",
    description:
      "Professional 22-yard synthetic pitch, high-intensity floodlights, and instant online booking.",
    images: ["/arena-image-1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Elixir Arena",
  description:
    "Professional indoor cricket ground featuring a 22-yard synthetic turf, AC arena, and high-lux floodlights.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Street 1, Block G North Nazimabad Town",
    addressLocality: "Karachi",
    postalCode: "75950",
    addressCountry: "PK",
  },
  telephone: "+92 339 4120006",
  email: "elixirarena@gmail.com",
  openingHours: "Mo-Fr 06:00-00:00, Sa-Su 05:00-01:00",
  priceRange: "$$",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${plusJakartaSans.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#0b0f0d] text-gray-100 font-sans selection:bg-tennis selection:text-black antialiased"
      >
        {children}
      </body>
    </html>
  )
}
