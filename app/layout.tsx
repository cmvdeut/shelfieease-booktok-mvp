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
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#0f0f12",
          color: "#fff"
        }}
      >
        <Script
          id="early-error-logging"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.__earlyErrors = [];
              function save(msg) {
                try {
                  localStorage.setItem("__early_error", msg.slice(0, 4000));
                } catch (e) {}
                console.error("[Early Error]", msg);
              }
              window.addEventListener("error", function(e) {
                var msg = "error: " + (e.message || "") + "\\n" + (e.filename || "") + ":" + (e.lineno || "") + "\\n" + (e.error && e.error.stack ? e.error.stack : "");
                save(msg);
                window.__earlyErrors.push(msg);
              });
              window.addEventListener("unhandledrejection", function(e) {
                var reason = e.reason;
                var msg = "rejection: " + (reason && reason.message ? reason.message : String(reason)) + "\\n" + (reason && reason.stack ? reason.stack : "");
                save(msg);
                window.__earlyErrors.push(msg);
              });
            `,
          }}
        />
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
