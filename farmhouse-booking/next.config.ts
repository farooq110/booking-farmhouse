import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow the preview deployment domain to access Next.js dev resources
  allowedDevOrigins: ["*.space-z.ai"],
};

export default nextConfig;
