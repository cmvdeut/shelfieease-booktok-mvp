"use client";

import Link from "next/link";
import { detectUiLang, t } from "@/lib/i18n";

export default function PrivacyPage() {
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
        {t({ nl: "Privacybeleid", en: "Privacy Policy" }, lang)}
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
            {t({ nl: "Gegevensopslag", en: "Data Storage" }, lang)}
          </h2>
          <p style={{ marginBottom: 12, color: "var(--muted)" }}>
            {t(
              {
                nl: "ShelfieEase slaat al je gegevens lokaal op in je browser. Je boeken, shelves en instellingen worden alleen opgeslagen op je apparaat en worden niet naar onze servers verzonden.",
                en: "ShelfieEase stores all your data locally in your browser. Your books, shelves and settings are only stored on your device and are not sent to our servers.",
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
            {t({ nl: "Backup en Restore", en: "Backup and Restore" }, lang)}
          </h2>
          <p style={{ marginBottom: 12, color: "var(--muted)" }}>
            {t(
              {
                nl: "Je kunt een backup maken van je gegevens via het menu. Deze backup wordt als JSON-bestand opgeslagen op je apparaat. Je kunt deze backup later gebruiken om je gegevens terug te zetten.",
                en: "You can create a backup of your data via the menu. This backup is saved as a JSON file on your device. You can use this backup later to restore your data.",
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
            {t({ nl: "Externe Diensten", en: "External Services" }, lang)}
          </h2>
          <p style={{ marginBottom: 12, color: "var(--muted)" }}>
            {t(
              {
                nl: "ShelfieEase gebruikt Google Books API en Open Library voor het ophalen van boekgegevens en covers. Deze diensten hebben hun eigen privacybeleid.",
                en: "ShelfieEase uses Google Books API and Open Library to fetch book data and covers. These services have their own privacy policies.",
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
                nl: "Voor vragen over privacy, neem gerust contact met ons op via:",
                en: "For questions about privacy, feel free to contact us at:",
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

