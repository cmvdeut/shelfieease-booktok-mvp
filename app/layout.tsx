import "./globals.css";

import Script from "next/script";
import { ClientErrorTrap } from "@/components/ClientErrorTrap";
import { MoodProvider } from "@/components/MoodProvider";
import { MoodSwitcher } from "@/components/MoodSwitcher";

export const metadata = {
  title: "ShelfieEase",
  description: "Scan books. Build your shelf. Share the vibe."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6d5efc" />
        <style dangerouslySetInnerHTML={{
          __html: `
:root {
  /* Default (Aesthetic) */
  --bg: #0b0b10;
  --bg2: #121218;
  --panel: rgba(21,21,28,0.78);
  --panel2: rgba(16,16,20,0.72);
  --border: rgba(255,255,255,0.10);
  --text: rgba(255,255,255,0.96);
  --muted: rgba(207,207,230,0.82);
  --accent1: #6d5efc;
  --accent2: #ff49f0;
  --shadow: rgba(0,0,0,0.55);
}

[data-mood="aesthetic"] {
  --bg: #0b0b10;
  --bg2: #121218;
  --panel: rgba(21,21,28,0.78);
  --panel2: rgba(16,16,20,0.72);
  --border: rgba(255,255,255,0.10);
  --text: rgba(255,255,255,0.96);
  --muted: rgba(207,207,230,0.82);
  --accent1: #6d5efc;
  --accent2: #ff49f0;
  --shadow: rgba(0,0,0,0.55);
}

[data-mood="bold"] {
  --bg: #07080a;
  --bg2: #0f1115;

  --panel: #121318;            /* GEEN translucency */
  --panel2: #0d0e13;

  --border: rgba(255,255,255,0.18);
  --text: rgba(255,255,255,0.98);
  --muted: rgba(255,255,255,0.70);

  --accent1: #ff6a00;
  --accent2: #ff9a3d;

  --shadow: rgba(0,0,0,0.85);
}

[data-mood="calm"] {
  --bg: #f5e7cf;                 /* warm zand/linnen */
  --bg2: #ead5b5;                /* iets donkerder zand (diepte) */

  --panel: rgba(255, 250, 242, 0.94);   /* paper panel */
  --panel2: rgba(250, 240, 226, 0.92);

  --border: rgba(88, 62, 36, 0.22);     /* warm bruin, subtiel */

  --text: #3a2412;               /* donkerbruin (goed contrast) */
  --muted: #6b4a2b;              /* secundair bruin (leesbaar) */

  --accent1: #8a5a2b;            /* warm bruin (CTA basis) */
  --accent2: #c48a46;            /* honing/brons (gradient top) */

  --shadow: rgba(58, 36, 18, 0.14);
}

[data-mood="calm"] * {
  text-shadow: none !important;
}

/* Calm mood: papier/linnen polish */
[data-mood="calm"] body {
  background:
    radial-gradient(900px 520px at 20% 10%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%),
    radial-gradient(900px 520px at 80% 18%, rgba(255,255,255,0.35), rgba(255,255,255,0) 62%),
    linear-gradient(180deg, var(--bg), var(--bg2));
}

[data-mood="calm"] body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.10; /* heel subtiel */
  background-image:
    repeating-linear-gradient(0deg, rgba(58,36,18,0.020) 0px, rgba(58,36,18,0.020) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px),
    repeating-linear-gradient(90deg, rgba(58,36,18,0.016) 0px, rgba(58,36,18,0.016) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 7px);
  mix-blend-mode: multiply;
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
        <MoodProvider>
          <ClientErrorTrap />
          {children}
        </MoodProvider>
        <MoodSwitcher />
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
