"use client";

import Link from "next/link";
import React from "react";
import { detectUiLang, t } from "@/lib/i18n";

export default function AboutPage() {
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
          marginBottom: 24,
          color: "var(--text)",
        }}
      >
        About ShelfieEase
      </h1>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "var(--text)",
        }}
      >
        <p style={{ marginBottom: 16 }}>
          ShelfieEase is built for book lovers who want clarity.
        </p>
        <p style={{ marginBottom: 16 }}>
          Easily scan books by ISBN and keep your library organized.
        </p>
        <p style={{ marginBottom: 16 }}>
          ShelfieEase is actively being developed and improved.
        </p>
        <p style={{ marginBottom: 24 }}>
          It&apos;s built by a book lover, for book lovers 📚
        </p>

        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 12,
            color: "var(--text)",
          }}
        >
          Have feedback or ideas?
        </h2>
        <p style={{ marginBottom: 8 }}>
          Suggestions are always welcome — they help shape the app.
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
          }}
        >
          Version 1.0 — Early release
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
        Made with ❤️ for book lovers
      </div>
    </main>
  );
}
