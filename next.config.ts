import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for multiple lockfiles warning - ensures Vercel uses correct root
  outputFileTracingRoot: require("path").join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        pathname: "/b/isbn/**",
      },
      {
        protocol: "https",
        hostname: "books.google.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "books.google.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
