import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js dev-tools indicator button (bottom-left "Preferences" panel).
  // This is a development-only UI element — not part of CampusNexus.
  // Official config option: https://nextjs.org/docs/app/api-reference/config/next-config-js/devIndicators
  devIndicators: false,
};

export default nextConfig;
