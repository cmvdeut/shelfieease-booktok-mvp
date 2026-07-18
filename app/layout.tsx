import "./globals.css";

import Script from "next/script";
import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { ClientErrorTrap } from "@/components/ClientErrorTrap";
import { MoodProvider } from "@/components/MoodProvider";
import { UiLangProvider } from "@/components/UiLangProvider";
import { MoodSwitcher } from "@/components/MoodSwitcher";
import { AppMenu } from "@/components/AppMenu";
import UiBoot from "@/components/UiBoot";
import { TikTokOAuthCallback } from "@/components/TikTokOAuthCallback";
import {
  buildJsonLdGraph,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  homeMetadata,
  KEYWORDS,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...homeMetadata,
  title: {
    default: DEFAULT_TITLE,
    template: "%s | ShelfieEase",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  manifest: "/site.webmanifest",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
    types: {
      "text/plain": [{ url: "/llms.txt", title: "LLM product summary" }],
    },
  },
  verification: {
    google: "AN7HjMnbeCLXP6sWheQrqxaW0wrmpd1HGcwr2t4RWrQ",
  },
  icons: {
    icon: [{ url: "/icons/v2/favicon.ico" }],
    apple: [{ url: "/icons/v2/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: [{ url: "/icons/v2/favicon-32.png", sizes: "32x32" }],
  },
};

const fontDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const fontBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // For iPhone safe areas
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <head>
        <meta name="theme-color" content="#7A2E42" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM product summary" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM full product context" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJsonLdGraph()),
          }}
        />
        <style dangerouslySetInnerHTML={{
          __html: `
/* "Modern Bookish Romance" — 70% clean/modern, 30% romantic-playful.
   Two modes: light (default) and dark (navy/plum, never pure black). */

:root, [data-mood="light"] {
  --bg: #FBF3EA;
  --bg2: #F7E9DE;
  --panel: #FDF6EE;
  --panel2: #FDF6EE;
  --panelSolid: #FFFDF9;
  --border: #E8D6C4;
  --borderStrong: #DCC0A5;

  --text: #4A1E2B;
  --muted: #7A4456;
  --muted2: #9C6B7C;

  --accent1: #7A2E42;
  --accent2: #E7B7C4;
  --accentTertiary: #F4D35E;
  --accentSoft: rgba(122,46,66,0.12);
  --accentSoft2: rgba(231,183,196,0.28);
  --decorAccent: #C9A6D9;

  --btnPrimaryBg: linear-gradient(90deg,#7A2E42,#9C4A5F);
  --btnPrimaryText: #FFF8F2;
  --btnGhostBg: rgba(122,46,66,0.06);
  --btnGhostBorder: #E8D6C4;
  --radiusButton: 20px;

  --shadow: rgba(74,30,43,0.14);
  --glow: rgba(231,183,196,0.25);
  --glow2: rgba(244,211,94,0.18);

  --danger: #C0435A;
  --dangerSoft: rgba(192,67,90,0.12);
}

[data-mood="dark"] {
  --bg: #241726;
  --bg2: #2E1B32;
  --panel: rgba(46,27,50,0.72);
  --panel2: rgba(46,27,50,0.72);
  --panelSolid: #2A1930;
  --border: rgba(255,255,255,0.10);
  --borderStrong: rgba(255,255,255,0.16);

  --text: #F7ECEF;
  --muted: rgba(247,236,239,0.75);
  --muted2: rgba(247,236,239,0.55);

  --accent1: #E7B7C4;
  --accent2: #F4D35E;
  --accentTertiary: #C9A6D9;
  --accentSoft: rgba(231,183,196,0.18);
  --accentSoft2: rgba(244,211,94,0.12);
  --decorAccent: #C9A6D9;

  --btnPrimaryBg: linear-gradient(90deg,#E7B7C4,#C9A6D9);
  --btnPrimaryText: #241726;
  --btnGhostBg: rgba(255,255,255,0.06);
  --btnGhostBorder: rgba(255,255,255,0.14);
  --radiusButton: 20px;

  --shadow: rgba(0,0,0,0.55);
  --glow: rgba(231,183,196,0.16);
  --glow2: rgba(201,166,217,0.16);

  --danger: #FF8FA0;
  --dangerSoft: rgba(255,143,160,0.14);
}

[data-mood="light"] * {
  text-shadow: none !important;
}

[data-mood="light"] body {
  background: var(--bg);
}

[data-mood="light"] body::before {
  display: none;
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

    function seReloadAfterChunkError() {
      var key = "se:chunk-reload-attempt";
      try {
        var n = parseInt(sessionStorage.getItem(key) || "0", 10);
        if (n < 2) {
          sessionStorage.setItem(key, String(n + 1));
          var u = new URL(location.href);
          u.searchParams.set("_se", String(Date.now()));
          location.replace(u.toString());
          return;
        }
      } catch (err) {}
      location.reload();
    }

    window.addEventListener("error", function (e) {
      if (e.message && e.message.indexOf("Failed to load chunk") !== -1) {
        seReloadAfterChunkError();
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
        seReloadAfterChunkError();
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
          fontFamily: "var(--font-body), system-ui, -apple-system, sans-serif",
          background: "var(--bg)",
          color: "var(--text)"
        }}
      >
        <UiBoot />
        <TikTokOAuthCallback />
        <UiLangProvider>
          <MoodProvider>
            <ClientErrorTrap />
            <AppMenu />
            {children}
          </MoodProvider>
        </UiLangProvider>
        <MoodSwitcher />
        <Script async src="https://plausible.io/js/pa-M1U-She7jLRkpuv6GfaOJ.js" />
        <script dangerouslySetInnerHTML={{ __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()` }} />
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
