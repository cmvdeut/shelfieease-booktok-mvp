import Link from "next/link";
import type { Metadata } from "next";
import { buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ISBN Book Scanner in Your Browser — ShelfieEase",
  description:
    "Scan book ISBN barcodes on your phone without downloading an app. Check duplicates in-store, add to your shelf, and share a BookTok-ready shelfie.",
  path: "/isbn-book-scanner",
  keywords: [
    "ISBN book scanner",
    "barcode scanner books",
    "scan books in bookstore",
    "book barcode app browser",
    "ISBN scanner no app",
  ],
});

const faqs = [
  {
    q: "Does the ISBN scanner work without an app?",
    a: "Yes. ShelfieEase runs in your mobile browser. Open the scan page and point your camera at the barcode.",
  },
  {
    q: "Can I use it in a bookstore?",
    a: "Yes — scan before you buy to see if you already own the title on your shelf.",
  },
  {
    q: "What if scanning fails?",
    a: "You can always enter the ISBN manually. Manual entry is built into the scan flow.",
  },
  {
    q: "Is it free?",
    a: "You can scan and catalog up to 10 books free. Unlimited is €4.99 one-time.",
  },
];

export default function IsbnBookScannerPage() {
  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", color: "var(--text)" }}>
      <div style={{ position: "relative", maxWidth: 600, margin: "0 auto", padding: "28px 24px 60px" }}>
        <nav style={{ marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
            ← ShelfieEase
          </Link>
        </nav>

        <h1 style={{ fontSize: "clamp(1.75rem, 2.25rem, 2.5rem)", fontWeight: 800, lineHeight: 1.1 }}>
          ISBN Book Scanner — No App Download
        </h1>
        <p style={{ marginTop: 16, fontSize: "1.0625rem", color: "var(--muted)", lineHeight: 1.6 }}>
          Scan barcodes in your browser, build your physical bookshelf, and avoid buying the same book twice.
          Built for readers who shop in bookstores and post on BookTok.
        </p>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/scan"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 16,
              padding: "14px 24px",
              fontWeight: 600,
              background: "var(--btnPrimaryBg)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              textDecoration: "none",
            }}
          >
            📷 Start scanning free
          </Link>
          <Link
            href="/booktok-shelf-tracker"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 16,
              padding: "14px 24px",
              fontWeight: 600,
              background: "var(--panel)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              textDecoration: "none",
            }}
          >
            BookTok shelf tracker
          </Link>
        </div>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 700, marginBottom: 20 }}>FAQ</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {faqs.map((faq) => (
              <div
                key={faq.q}
                style={{
                  padding: "16px 18px",
                  borderRadius: 14,
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{faq.q}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [buildFaqJsonLd(faqs)],
          }),
        }}
      />
    </main>
  );
}
