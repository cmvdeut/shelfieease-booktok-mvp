import "./globals.css";

import Script from "next/script";
import { ClientErrorTrap } from "@/components/ClientErrorTrap";

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
          background: "#0f0f12",
          color: "#fff"
        }}
      >
        <ClientErrorTrap />
        {children}
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
