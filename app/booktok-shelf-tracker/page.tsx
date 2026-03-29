import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BookTok Shelf Tracker — Scan, Organize & Share Your Books | ShelfieEase",
  description:
    "The free BookTok shelf tracker. Scan books by ISBN, organize them into shelves, and generate a TikTok-ready shelfie card in seconds. Built for BookTok creators.",
  openGraph: {
    title: "BookTok Shelf Tracker — ShelfieEase",
    description:
      "Scan books by ISBN, build your shelf, and share a TikTok-ready shelfie card. The book tracker built for BookTok creators.",
    url: "/booktok-shelf-tracker",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://www.shelfieease.app/booktok-shelf-tracker",
  },
};

const steps = [
  {
    icon: "📷",
    title: "Scan or type your ISBN",
    body: "Point your camera at any book barcode. Works with most modern phones — no app download needed.",
  },
  {
    icon: "🧺",
    title: "Organize into shelves",
    body: 'Create shelves like "TBR", "Currently Reading", or "Faves" with custom names and emojis.',
  },
  {
    icon: "🪄",
    title: "Share your Shelfie",
    body: 'Generate a 9:16 shelfie card, perfect for TikTok, Instagram Reels, or a BookTok "current reads" video.',
  },
];

const faqs = [
  {
    q: "Is ShelfieEase free?",
    a: "Yes — you can scan up to 10 books for free. Unlock unlimited books and shelves for a one-time payment of €4.99.",
  },
  {
    q: "Do I need to download an app?",
    a: "No. ShelfieEase runs entirely in your browser. Open it on your phone and start scanning immediately.",
  },
  {
    q: "What is a BookTok shelf tracker?",
    a: "A BookTok shelf tracker is a tool that helps book lovers on TikTok catalog their physical books, track their reading progress, and share their shelf with their audience.",
  },
  {
    q: "What does the shelfie card look like?",
    a: "It's a 9:16 portrait card showing your book covers with your username — sized perfectly for TikTok and Instagram Reels.",
  },
];

export default function BooktokShelfTrackerPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* Background glow */}
      <div style={{ pointerEvents: "none", position: "fixed", inset: 0 }}>
        <div
          style={{
            position: "absolute",
            top: -96,
            left: -96,
            width: 288,
            height: 288,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent1) 20%, transparent), transparent)",
            filter: "blur(64px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent2) 15%, transparent), transparent)",
            filter: "blur(64px)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: 600,
          margin: "0 auto",
          padding: "28px 24px 60px",
        }}
      >
        {/* Nav back */}
        <nav style={{ marginBottom: 24 }}>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "var(--muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ← ShelfieEase
          </Link>
        </nav>

        {/* Hero */}
        <section>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--muted)",
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "4px 10px",
              marginBottom: 16,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
            </svg>
            700+ views on TikTok
          </div>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 2.25rem, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "var(--text)",
            }}
          >
            The BookTok Shelf Tracker Built for Creators
          </h1>

          <p
            style={{
              marginTop: 16,
              fontSize: "clamp(1rem, 1.125rem, 1.125rem)",
              color: "var(--muted)",
              lineHeight: 1.6,
              maxWidth: 480,
            }}
          >
            Scan books by ISBN, sort them into shelves, and share a
            TikTok-ready shelfie card — all in your browser, no app download
            needed.
          </p>

          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/scan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 16,
                padding: "14px 24px",
                fontSize: "1.125rem",
                fontWeight: 600,
                background: "var(--btnPrimaryBg)",
                boxShadow: "0 8px 24px var(--shadow)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 20 }}>📷</span>
              Start tracking free
            </Link>

            <Link
              href="/library"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 16,
                padding: "14px 24px",
                fontSize: "1rem",
                fontWeight: 600,
                background: "var(--panel)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <span>📚</span> View demo shelf
            </Link>
          </div>

          <p
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "var(--muted2)",
              opacity: 0.7,
            }}
          >
            Free · no sign-up · works on any phone
          </p>
        </section>

        {/* How it works */}
        <section style={{ marginTop: 56 }}>
          <h2
            style={{
              fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 24,
            }}
          >
            How it works
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "16px 18px",
                  borderRadius: 16,
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>
                  {step.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: 4,
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {step.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ marginTop: 56 }}>
          <h2
            style={{
              fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 24,
            }}
          >
            Why BookTok creators use ShelfieEase
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {[
              { icon: "⚡", title: "Instant ISBN scan", body: "Works with most phone cameras — no extra hardware." },
              { icon: "📊", title: "Reading stats", body: "TBR · Reading · Finished — always up to date." },
              { icon: "🎨", title: "Custom shelves", body: "Name them anything, add an emoji, make it yours." },
              { icon: "🪄", title: "9:16 shelfie card", body: "Tap share → ready for TikTok or Reels." },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "var(--panel2)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 4,
                  }}
                >
                  {f.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>
                  {f.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ — keyword-rich for SEO */}
        <section style={{ marginTop: 56 }}>
          <h2
            style={{
              fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 24,
            }}
          >
            Frequently asked questions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 18px",
                  borderRadius: 14,
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 6,
                  }}
                >
                  {faq.q}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    lineHeight: 1.55,
                  }}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section
          style={{
            marginTop: 56,
            padding: "28px 24px",
            borderRadius: 20,
            background: "var(--panel)",
            border: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
          <h2
            style={{
              fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Ready to build your BookTok shelf?
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 20,
              lineHeight: 1.5,
            }}
          >
            Start free — scan up to 10 books with no sign-up. Unlock unlimited
            for a one-time €4.99.
          </p>
          <Link
            href="/scan"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 16,
              padding: "14px 28px",
              fontSize: "1.125rem",
              fontWeight: 600,
              background: "var(--btnPrimaryBg)",
              boxShadow: "0 8px 24px var(--shadow)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 20 }}>📷</span>
            Start scanning free
          </Link>
        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 8 }}>
            Built with love for book lovers 📚
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <a
              href="/privacy"
              style={{ fontSize: 12, color: "var(--muted2)", textDecoration: "none" }}
            >
              Privacy policy
            </a>
            <a
              href="/terms"
              style={{ fontSize: 12, color: "var(--muted2)", textDecoration: "none" }}
            >
              Terms of service
            </a>
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
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />
    </main>
  );
}
