import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goodreads Alternative for BookTok — ShelfieEase",
  description:
    "Looking for a Goodreads alternative built for BookTok? ShelfieEase lets you scan books, build shelves, and share a TikTok-ready shelfie card — no account needed.",
  openGraph: {
    title: "Goodreads Alternative for BookTok — ShelfieEase",
    description:
      "Scan books, build shelves, and share a TikTok-ready shelfie card. No account needed. Built for BookTok creators.",
    url: "/goodreads-alternative",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://www.shelfieease.app/goodreads-alternative",
  },
};

const comparison = [
  {
    feature: "No account needed",
    shelfieease: true,
    goodreads: false,
  },
  {
    feature: "TikTok-ready 9:16 shelfie card",
    shelfieease: true,
    goodreads: false,
  },
  {
    feature: "ISBN barcode scanner",
    shelfieease: true,
    goodreads: false,
  },
  {
    feature: "Works instantly in your browser",
    shelfieease: true,
    goodreads: false,
  },
  {
    feature: "Custom shelves with emojis",
    shelfieease: true,
    goodreads: false,
  },
  {
    feature: "Book catalog (millions of titles)",
    shelfieease: true,
    goodreads: true,
  },
  {
    feature: "Reading stats",
    shelfieease: true,
    goodreads: true,
  },
  {
    feature: "Social network / friends",
    shelfieease: false,
    goodreads: true,
  },
];

const faqs = [
  {
    q: "Is ShelfieEase really free?",
    a: "Yes — scan up to 10 books for free with no account. Unlock unlimited books and shelves for a one-time payment of €4.99.",
  },
  {
    q: "Why would I switch from Goodreads?",
    a: "If you create content on TikTok or Instagram, ShelfieEase gives you something Goodreads never will: a 9:16 shelfie card you can post directly. No screenshot hacks, no cropping — just tap share.",
  },
  {
    q: "Do I need to download an app?",
    a: "No. ShelfieEase runs entirely in your browser. Open it on your phone and start scanning immediately.",
  },
  {
    q: "Can I use both Goodreads and ShelfieEase?",
    a: "Absolutely. Many BookTok creators use Goodreads to track their reading history and ShelfieEase to generate shareable shelf visuals for their content.",
  },
];

export default function GoodreadsAlternativePage() {
  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Background glow */}
      <div style={{ pointerEvents: "none", position: "fixed", inset: 0 }}>
        <div style={{
          position: "absolute", top: -96, left: -96,
          width: 288, height: 288, borderRadius: "50%",
          background: "radial-gradient(circle, color-mix(in srgb, var(--accent1) 20%, transparent), transparent)",
          filter: "blur(64px)",
        }} />
        <div style={{
          position: "absolute", bottom: -120, right: -80,
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, color-mix(in srgb, var(--accent2) 15%, transparent), transparent)",
          filter: "blur(64px)",
        }} />
      </div>

      <div style={{ position: "relative", maxWidth: 600, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Nav back */}
        <nav style={{ marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
            ← ShelfieEase
          </Link>
        </nav>

        {/* Hero */}
        <section>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 600, color: "var(--muted)",
            background: "var(--panel)", border: "1px solid var(--border)",
            borderRadius: 999, padding: "4px 10px", marginBottom: 16,
          }}>
            📚 Built for BookTok creators
          </div>

          <h1 style={{
            fontSize: "clamp(1.75rem, 2.25rem, 2.5rem)",
            fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1,
          }}>
            The Goodreads Alternative Built for BookTok
          </h1>

          <p style={{
            marginTop: 16,
            fontSize: "clamp(1rem, 1.125rem, 1.125rem)",
            color: "var(--muted)", lineHeight: 1.6, maxWidth: 480,
          }}>
            Goodreads is great for tracking books. But if you create content on
            TikTok or Instagram, you need something it was never built to give
            you: a share-ready shelfie card.
          </p>

          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/scan" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              gap: 8, borderRadius: 16, padding: "14px 24px",
              fontSize: "1.125rem", fontWeight: 600,
              background: "var(--btnPrimaryBg)", boxShadow: "0 8px 24px var(--shadow)",
              border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none",
            }}>
              <span style={{ fontSize: 20 }}>📷</span>
              Try ShelfieEase free
            </Link>
          </div>

          <p style={{ marginTop: 10, fontSize: 12, color: "var(--muted2)", opacity: 0.7 }}>
            Free · no sign-up · works on any phone
          </p>
        </section>

        {/* The one thing Goodreads can't do */}
        <section style={{ marginTop: 56 }}>
          <h2 style={{
            fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)",
            fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16,
          }}>
            The one thing Goodreads can&apos;t do
          </h2>

          <div style={{
            padding: "20px 22px", borderRadius: 18,
            background: "var(--panel)", border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🪄</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
              A 9:16 shelfie card, ready to post
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
              ShelfieEase generates a portrait-format visual of your current shelf —
              sized perfectly for TikTok and Instagram Reels. No screenshots,
              no cropping, no design tools. Tap share, done.
            </p>
          </div>
        </section>

        {/* Comparison table */}
        <section style={{ marginTop: 56 }}>
          <h2 style={{
            fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)",
            fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 20,
          }}>
            ShelfieEase vs Goodreads
          </h2>

          <div style={{
            borderRadius: 16, overflow: "hidden",
            border: "1px solid var(--border)",
          }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 120px 120px",
              padding: "10px 16px",
              background: "var(--panel2)",
              borderBottom: "1px solid var(--border)",
              fontSize: 12, fontWeight: 700, color: "var(--muted)",
            }}>
              <div>Feature</div>
              <div style={{ textAlign: "center" }}>ShelfieEase</div>
              <div style={{ textAlign: "center" }}>Goodreads</div>
            </div>

            {comparison.map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 120px 120px",
                padding: "12px 16px",
                borderBottom: i < comparison.length - 1 ? "1px solid var(--border)" : "none",
                background: i % 2 === 0 ? "transparent" : "var(--panel)",
              }}>
                <div style={{ fontSize: 13, color: "var(--text)", display: "flex", alignItems: "center" }}>
                  {row.feature}
                </div>
                <div style={{ textAlign: "center", fontSize: 18 }}>
                  {row.shelfieease ? "✅" : "❌"}
                </div>
                <div style={{ textAlign: "center", fontSize: 18 }}>
                  {row.goodreads ? "✅" : "❌"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section style={{ marginTop: 56 }}>
          <h2 style={{
            fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)",
            fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 20,
          }}>
            Who ShelfieEase is for
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "🎥", title: "BookTok creators", body: "You post reading content on TikTok and want a quick way to show your current shelf without spending time in Canva." },
              { icon: "📸", title: "Instagram bookstagrammers", body: "You share shelfie photos on Instagram and want a clean digital version for Stories or Reels." },
              { icon: "📚", title: "Casual readers", body: "You just want to scan your books quickly without creating an account or learning a new social network." },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: 14, padding: "14px 16px",
                borderRadius: 14, background: "var(--panel)", border: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: 24, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginTop: 56 }}>
          <h2 style={{
            fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)",
            fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 20,
          }}>
            Frequently asked questions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                padding: "16px 18px", borderRadius: 14,
                background: "var(--panel)", border: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{faq.q}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{
          marginTop: 56, padding: "28px 24px", borderRadius: 20,
          background: "var(--panel)", border: "1px solid var(--border)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
          <h2 style={{
            fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)",
            fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8,
          }}>
            Ready to try it?
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20, lineHeight: 1.5 }}>
            No account needed. Scan your first book in 30 seconds.
          </p>
          <Link href="/scan" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            gap: 8, borderRadius: 16, padding: "14px 28px",
            fontSize: "1.125rem", fontWeight: 600,
            background: "var(--btnPrimaryBg)", boxShadow: "0 8px 24px var(--shadow)",
            border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none",
          }}>
            <span style={{ fontSize: 20 }}>📷</span>
            Start scanning free
          </Link>
        </section>

        {/* Footer */}
        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 8 }}>
            Built with love for book lovers 📚
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 12, color: "var(--muted2)", textDecoration: "none" }}>Privacy policy</a>
            <a href="/terms" style={{ fontSize: 12, color: "var(--muted2)", textDecoration: "none" }}>Terms of service</a>
          </div>
        </footer>
      </div>

      {/* JSON-LD FAQ schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />
    </main>
  );
}
