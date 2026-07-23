import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: false },
  reactStrictMode: false,
  allowedDevOrigins: ["*.space-z.ai"],
  logging: { browserToTerminal: process.env.NODE_ENV !== "production" },
  images: {
    qualities: [50, 60, 75, 90],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.space-z.ai" },
    ],
  },
  experimental: { viewTransition: true },
};

export default nextConfig;
