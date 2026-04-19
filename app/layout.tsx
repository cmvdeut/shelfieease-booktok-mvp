import "./globals.css";

import Script from "next/script";
import { ClientErrorTrap } from "@/components/ClientErrorTrap";
import { MoodProvider } from "@/components/MoodProvider";
import { MoodSwitcher } from "@/components/MoodSwitcher";
import { AppMenu } from "@/components/AppMenu";
import UiBoot from "@/components/UiBoot";

const siteUrl =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "https://www.shelfieease.app";

export const metadata = {
  title: "ShelfieEase — Book Scanning & Shelf Tracker for BookTok",
  description: "Scan books by ISBN, build your shelf, and share a TikTok-ready shelfie in seconds. The book tracker built for BookTok creators.",
  manifest: "/site.webmanifest",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "ShelfieEase — Book Scanning & Shelf Tracker for BookTok",
    description: "Scan books by ISBN, build your shelf, and share a TikTok-ready shelfie in seconds. The book tracker built for BookTok creators.",
    url: "/",
    siteName: "ShelfieEase",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ShelfieEase — Book Scanning & Shelf Tracker for BookTok",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShelfieEase — Book Scanning & Shelf Tracker for BookTok",
    description: "Scan books by ISBN, build your shelf, and share a TikTok-ready shelfie in seconds.",
    images: ["/opengraph-image"],
  },
  verification: {
    google: "AN7HjMnbeCLXP6sWheQrqxaW0wrmpd1HGcwr2t4RWrQ",
  },
  icons: {
    icon: [
      { url: "/icons/v2/favicon.ico" },
    ],
    apple: [{ url: "/icons/v2/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: [{ url: "/icons/v2/favicon-32.png", sizes: "32x32" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // For iPhone safe areas
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#6B4EFF" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ShelfieEase",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web",
              "description": "Scan books by ISBN, build your shelf, and share a TikTok-ready shelfie in seconds. The book tracker built for BookTok creators.",
              "url": "https://www.shelfieease.app",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
        <style dangerouslySetInnerHTML={{
          __html: `
:root {
  /* Default (Aesthetic) */
  --bg: #0B0B10;
  --bg2: #12111A;
  --panel: rgba(18,17,26,0.72);
  --panel2: rgba(18,17,26,0.72);
  --panelSolid: #14131D;
  --border: rgba(255,255,255,0.10);
  --borderStrong: rgba(255,255,255,0.16);
  --text: #FFFFFF;
  --muted: rgba(255,255,255,0.72);
  --muted2: rgba(255,255,255,0.55);
  --accent1: #6D5EFC;
  --accent2: #FF49F0;
  --accentSoft: rgba(109,94,252,0.22);
  --accentSoft2: rgba(255,73,240,0.14);
  --btnPrimaryBg: linear-gradient(90deg,#6D5EFC,#FF49F0);
  --btnPrimaryText: #FFFFFF;
  --btnGhostBg: rgba(255,255,255,0.06);
  --btnGhostBorder: rgba(255,255,255,0.12);
  --shadow: rgba(0,0,0,0.55);
  --glow: rgba(255,73,240,0.18);
  --glow2: rgba(109,94,252,0.22);
  --danger: #FF6B6B;
  --dangerSoft: rgba(255,107,107,0.12);
}

[data-mood="default"] {
  --bg: #0B0B10;
  --bg2: #12111A;
  --panel: rgba(18,17,26,0.72);
  --panel2: rgba(18,17,26,0.72);
  --panelSolid: #14131D;
  --border: rgba(255,255,255,0.10);
  --borderStrong: rgba(255,255,255,0.16);
  --text: #FFFFFF;
  --muted: rgba(255,255,255,0.72);
  --muted2: rgba(255,255,255,0.55);
  --accent1: #6D5EFC;
  --accent2: #FF49F0;
  --accentSoft: rgba(109,94,252,0.22);
  --accentSoft2: rgba(255,73,240,0.14);
  --btnPrimaryBg: linear-gradient(90deg,#6D5EFC,#FF49F0);
  --btnPrimaryText: #FFFFFF;
  --btnGhostBg: rgba(255,255,255,0.06);
  --btnGhostBorder: rgba(255,255,255,0.12);
  --shadow: rgba(0,0,0,0.55);
  --glow: rgba(255,73,240,0.18);
  --glow2: rgba(109,94,252,0.22);
  --danger: #FF6B6B;
  --dangerSoft: rgba(255,107,107,0.12);
}

[data-mood="bold"] {
  --bg: #0B0B0D;                 /* Background */
  --bg2: #141418;                /* Background 2 */

  --panel: #111113;               /* Card background */
  --panel2: #111113;              /* Card background 2 */
  --panelSolid: #111113;          /* Solid panel */

  --border: rgba(255,255,255,0.20);  /* Borders */
  --borderStrong: rgba(255,255,255,0.30);  /* Strong borders */

  --text: #FFFFFF;                /* Primary text */
  --muted: #CFCFD4;              /* Secondary text */
  --muted2: #8B8B92;             /* Muted text */

  --accent1: #FF8A00;            /* Primary accent (oranje) */
  --accent2: #FF8A00;            /* Primary accent 2 (oranje) */
  --accentSoft: rgba(255,138,0,0.15);  /* Soft accent */
  --accentSoft2: rgba(255,138,0,0.10);  /* Soft accent 2 */

  --btnPrimaryBg: linear-gradient(90deg,#FF8A00,#FF8A00);
  --btnPrimaryText: #FFFFFF;
  --btnGhostBg: rgba(255,255,255,0.06);
  --btnGhostBorder: rgba(255,255,255,0.12);

  --shadow: rgba(0,0,0,0.90);    /* Deep shadows */
  --glow: transparent;            /* No glow */
  --glow2: transparent;          /* No glow 2 */

  --danger: #FF6B6B;
  --dangerSoft: rgba(255,107,107,0.12);
}

[data-mood="calm"] {
  --bg: #F4EADB;                 /* Background */
  --bg2: #EFE3D1;                /* Background 2 */

  --panel: #F7F0E4;              /* Card background */
  --panel2: #F7F0E4;             /* Card background 2 */
  --panelSolid: #F7F0E4;          /* Solid panel */

  --border: #D8C6A8;  /* Borders */
  --borderStrong: #D8C6A8;  /* Strong borders */

  --text: #4A3825;               /* Primary text */
  --muted: #6B553A;              /* Secondary text */
  --muted2: #6B553A;             /* Muted text */

  --accent1: #9C6B2F;            /* Primary accent */
  --accent2: #9C6B2F;            /* Primary accent 2 */
  --accentSoft: rgba(156, 107, 47, 0.15);  /* Soft accent */
  --accentSoft2: rgba(156, 107, 47, 0.10);  /* Soft accent 2 */

  --btnPrimaryBg: linear-gradient(90deg,#9C6B2F,#9C6B2F);
  --btnPrimaryText: #4A3825;
  --btnGhostBg: rgba(58, 42, 26, 0.06);
  --btnGhostBorder: #D8C6A8;

  --shadow: rgba(58, 42, 26, 0.12);      /* Subtle shadows */
  --glow: transparent;            /* No glow */
  --glow2: transparent;          /* No glow 2 */

  --danger: #C85A5A;
  --dangerSoft: rgba(200, 90, 90, 0.12);
}

[data-mood="calm"] * {
  text-shadow: none !important;
}

/* Calm mood: Senior-Ease / rust / vertrouwen / warm */
[data-mood="calm"] body {
  background: var(--bg); /* Effen achtergrondkleur, geen gradient */
}

[data-mood="calm"] body::before {
  display: none; /* Geen overlay of texture in Calm */
}
          `
        }} />
        <Script
          id="early-error-logger"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    window.__seLog = function (kind, payload) {
      try {
        var obj = { t: Date.now(), kind: kind, payload: payload };
        localStorage.setItem("se:earlyError", JSON.stringify(obj));
      } catch (e) {}
    };

    window.addEventListener("error", function (e) {
      if (e.message && e.message.indexOf("Failed to load chunk") !== -1) {
        window.location.reload();
        return;
      }
      window.__seLog("window.error", {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error && e.error.stack ? e.error.stack : null
      });
    });

    window.addEventListener("unhandledrejection", function (e) {
      var r = e.reason || {};
      if (r.message && r.message.indexOf("Failed to load chunk") !== -1) {
        window.location.reload();
        return;
      }
      window.__seLog("unhandledrejection", {
        message: r.message || String(r),
        stack: r.stack || null
      });
    });
  } catch (e) {}
})();
            `,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "var(--bg)",
          color: "var(--text)"
        }}
      >
        <UiBoot />
        <MoodProvider>
          <ClientErrorTrap />
          <AppMenu />
          {children}
        </MoodProvider>
        <MoodSwitcher />
        <Script
          defer
          data-domain="shelfieease.app"
          src="https://plausible.io/js/script.tagged-events.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
             // if ('serviceWorker' in navigator) {
             //   window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
             // }
            `
          }}
        />
      </body>
    </html>
  );
}
