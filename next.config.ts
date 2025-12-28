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
  // Cloudflare Pages compatibility - use static export when CF_PAGES env is set
  // Note: All pages must be client-side ("use client") for static export to work
  output: process.env.CF_PAGES === "1" ? "export" : undefined,
};

export default nextConfig;
