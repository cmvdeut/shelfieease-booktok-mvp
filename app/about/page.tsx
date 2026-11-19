"use client";

import Link from "next/link";
import React from "react";
import { t } from "@/lib/i18n";
import { useUiLang } from "@/components/UiLangProvider";

export default function AboutPage() {
  const { lang } = useUiLang();

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
          marginBottom: 24,
          color: "var(--text)",
        }}
      >
        {t({ nl: "Over ShelfieEase", en: "About ShelfieEase" }, lang)}
      </h1>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "var(--text)",
        }}
      >
        <p style={{ marginBottom: 16 }}>
          {t(
            {
              nl: "ShelfieEase is gemaakt voor boekliefhebbers die overzicht willen.",
              en: "ShelfieEase is built for book lovers who want clarity.",
            },
            lang
          )}
        </p>
        <p style={{ marginBottom: 16 }}>
          {t(
            {
              nl: "Scan boeken eenvoudig via ISBN en houd je bibliotheek georganiseerd.",
              en: "Easily scan books by ISBN and keep your library organized.",
            },
            lang
          )}
        </p>
        <p style={{ marginBottom: 16 }}>
          {t(
            {
              nl: "ShelfieEase wordt actief ontwikkeld en verbeterd.",
              en: "ShelfieEase is actively being developed and improved.",
            },
            lang
          )}
        </p>
        <p style={{ marginBottom: 24 }}>
          {t(
            {
              nl: "Gemaakt door een boekliefhebber, voor boekliefhebbers 📚",
              en: "It's built by a book lover, for book lovers 📚",
            },
            lang
          )}
        </p>

        <div
          style={{
            marginBottom: 24,
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid var(--border)",
            background: "var(--panelSolid)",
          }}
        >
          <p style={{ margin: "0 0 6px", fontWeight: 700 }}>
            {t(
              {
                nl: "ShelfieEase is een product van Ease Works.",
                en: "ShelfieEase is a product of Ease Works.",
              },
              lang
            )}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
            {t(
              {
                nl: "KvK 42201315 · Nederland",
                en: "Chamber of Commerce (KvK) 42201315 · the Netherlands",
              },
              lang
            )}
          </p>
        </div>

        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 12,
            color: "var(--text)",
          }}
        >
          {t({ nl: "Feedback of ideeën?", en: "Have feedback or ideas?" }, lang)}
        </h2>
        <p style={{ marginBottom: 8 }}>
          {t(
            {
              nl: "Suggesties zijn altijd welkom — zo groeit de app mee.",
              en: "Suggestions are always welcome — they help shape the app.",
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
          }}
        >
          support@shelfieease.app
        </a>

        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            marginBottom: 8,
            marginTop: 16,
          }}
        >
          {t({ nl: "Versie 1.0 — vroege release", en: "Version 1.0 — Early release" }, lang)}
        </p>
      </div>

      <div
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          fontSize: 12,
          color: "var(--muted2)",
        }}
      >
        {t(
          {
            nl: "Met ❤️ gemaakt voor boekliefhebbers",
            en: "Made with ❤️ for book lovers",
          },
          lang
        )}
      </div>
    </main>
  );
}
