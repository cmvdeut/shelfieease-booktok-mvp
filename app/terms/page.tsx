"use client";

import Link from "next/link";
import { detectUiLang, t } from "@/lib/i18n";

export default function TermsPage() {
  const lang = detectUiLang();

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "28px 24px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/"
          style={{
            color: "var(--accent1)",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ← {t({ nl: "Terug", en: "Back" }, lang)}
        </Link>
      </div>

      <h1
        style={{
          fontSize: "clamp(1.875rem, 2.5rem, 2.25rem)",
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
          marginBottom: 16,
          color: "var(--text)",
        }}
      >
        {t({ nl: "Gebruiksvoorwaarden", en: "Terms of Service" }, lang)}
      </h1>

      <div
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--text)",
        }}
      >
        <p style={{ marginBottom: 16, color: "var(--muted)" }}>
          {t(
            {
              nl: "Laatst bijgewerkt: " + new Date().toLocaleDateString("nl-NL"),
              en: "Last updated: " + new Date().toLocaleDateString("en-US"),
            },
            lang
          )}
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--text)",
            }}
          >
            {t({ nl: "Gebruik van de app", en: "Use of the App" }, lang)}
          </h2>
          <p style={{ marginBottom: 12, color: "var(--muted)" }}>
            {t(
              {
                nl: "ShelfieEase is een persoonlijke boekenplank-app. Je mag de app gebruiken voor persoonlijke, niet-commerciële doeleinden. Je bent zelf verantwoordelijk voor de inhoud die je opslaat.",
                en: "ShelfieEase is a personal bookshelf app. You may use the app for personal, non-commercial purposes. You are responsible for the content you store.",
              },
              lang
            )}
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--text)",
            }}
          >
            {t({ nl: "Betaling en licentie", en: "Payment and License" }, lang)}
          </h2>
          <p style={{ marginBottom: 12, color: "var(--muted)" }}>
            {t(
              {
                nl: "De volledige versie van ShelfieEase is beschikbaar voor een eenmalige betaling van €4,99. Na betaling krijg je een levenslange licentie voor de volledige functionaliteit. Er zijn geen terugkerende kosten.",
                en: "The full version of ShelfieEase is available for a one-time payment of €4.99. After payment you receive a lifetime license for the full functionality. There are no recurring costs.",
              },
              lang
            )}
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--text)",
            }}
          >
            {t({ nl: "Aansprakelijkheid", en: "Liability" }, lang)}
          </h2>
          <p style={{ marginBottom: 12, color: "var(--muted)" }}>
            {t(
              {
                nl: "ShelfieEase wordt aangeboden zoals het is. Wij zijn niet aansprakelijk voor verlies van gegevens. Maak regelmatig een backup via het menu.",
                en: "ShelfieEase is provided as-is. We are not liable for data loss. Make regular backups via the menu.",
              },
              lang
            )}
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--text)",
            }}
          >
            {t({ nl: "Contact", en: "Contact" }, lang)}
          </h2>
          <p style={{ marginBottom: 8, color: "var(--muted)" }}>
            {t(
              {
                nl: "Voor vragen over de gebruiksvoorwaarden, neem contact op via:",
                en: "For questions about the terms of service, contact us at:",
              },
              lang
            )}
          </p>
          <a
            href="mailto:support@shelfieease.app"
            style={{
              fontSize: 15,
              color: "var(--accent1)",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            support@shelfieease.app
          </a>
        </section>
      </div>
    </main>
  );
}
