import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ShelfieEase — Book Scanning & Shelf Tracker for BookTok";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0B0B10",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(109,94,252,0.18)",
            top: -120,
            left: -80,
            filter: "blur(80px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,73,240,0.14)",
            bottom: -100,
            right: -60,
            filter: "blur(80px)",
            display: "flex",
          }}
        />

        {/* Book emoji row */}
        <div
          style={{
            fontSize: 48,
            marginBottom: 32,
            letterSpacing: 8,
            display: "flex",
            gap: 16,
          }}
        >
          📚 📖 📚
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            background: "linear-gradient(90deg, #6D5EFC, #FF49F0)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 16,
            letterSpacing: -1,
            display: "flex",
          }}
        >
          ShelfieEase
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: "#FFFFFF",
            marginBottom: 20,
            letterSpacing: 6,
            display: "flex",
          }}
        >
          Scan · Shelf · Share
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.60)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
            display: "flex",
          }}
        >
          The book tracker built for BookTok creators
        </div>

        {/* URL badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 24,
            padding: "8px 20px",
          }}
        >
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.50)", display: "flex" }}>
            shelfieease.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
