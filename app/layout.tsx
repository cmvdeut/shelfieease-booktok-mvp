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
