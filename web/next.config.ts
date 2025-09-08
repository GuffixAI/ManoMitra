import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["img.youtube.com"], // ✅ Add this line
  },
};

export default nextConfig;
