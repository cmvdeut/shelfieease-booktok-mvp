import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix for multiple lockfiles warning - ensures Vercel uses correct root
  outputFileTracingRoot: path.join(__dirname),
  // Force webpack for production so we never serve Turbopack chunks (avoids chunk load errors on production)
  webpack: (config) => config,
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
