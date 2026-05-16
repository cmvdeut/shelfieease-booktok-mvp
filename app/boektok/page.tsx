import Link from "next/link";
import type { Metadata } from "next";
import { buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "BoekTok Shelf Tracker — Scan, orden & deel je kast | ShelfieEase",
  description:
    "De BoekTok-app in je browser: scan ISBN-streepjescodes, houd je fysieke boekenkast bij, voorkom dubbele aankopen en deel een 9:16 shelfie voor TikTok en Reels. Gratis tot 10 boeken.",
  path: "/boektok",
  keywords: [
    "boektok",
    "boektok app",
    "boekenkast app",
    "isbn scanner boeken",
    "boeken scanner",
    "tbr bijhouden",
    "fysieke boekenkast",
  ],
});

const faqs = [
  {
    q: "Wat is een BoekTok shelf tracker?",
    a: "Een tool waarmee je fysieke boeken scant, op planken zet en je leesstatus bijhoudt — met een deelbare shelfie voor TikTok of Instagram.",
  },
  {
    q: "Moet ik een account aanmaken?",
    a: "Nee. Je kunt direct in je browser beginnen met scannen, zonder app-download.",
  },
  {
    q: "Werkt het in de boekhandel?",
    a: "Ja. Scan een boek voordat je koopt om te zien of je het al op je shelf hebt staan.",
  },
  {
    q: "Wat kost het?",
    a: "Gratis tot 10 boeken. Onbeperkt is eenmalig €4,99.",
  },
];

export default function BoektokPage() {
  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", color: "var(--text)" }} lang="nl">
      <div style={{ position: "relative", maxWidth: 600, margin: "0 auto", padding: "28px 24px 60px" }}>
        <nav style={{ marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
            ← ShelfieEase
          </Link>
        </nav>

        <p
          style={{
            display: "inline-block",
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
          Gratis te testen · geen account nodig
        </p>

        <h1 style={{ fontSize: "clamp(1.75rem, 2.25rem, 2.5rem)", fontWeight: 800, lineHeight: 1.1 }}>
          BoekTok shelf tracker voor je fysieke kast
        </h1>
        <p style={{ marginTop: 16, fontSize: "1.0625rem", color: "var(--muted)", lineHeight: 1.6 }}>
          Scan je boeken, zet je TBR op orde en deel een mooie shelfie — zonder app te downloaden.
          Ideaal voor BoekTok, YA-haulcontent en boekhandel-momenten.
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
            📷 Gratis beginnen met scannen
          </Link>
          <Link
            href="/library"
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
            📚 Bekijk demo shelf
          </Link>
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: "var(--muted2)" }}>
          Minder dan één dubbele aankoop — €4,99 eenmalig voor onbeperkt
        </p>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 700, marginBottom: 20 }}>Veelgestelde vragen</h2>
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
