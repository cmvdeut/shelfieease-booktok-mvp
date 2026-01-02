"use client";

import Link from "next/link";
import { detectUiLang, t } from "@/lib/i18n";

export default function HelpPage() {
  const lang = detectUiLang();

  const faqs = [
    {
      q: t(
        {
          nl: "Hoe voeg ik een boek toe?",
          en: "How do I add a book?",
        },
        lang
      ),
      a: t(
        {
          nl: "Je kunt een boek toevoegen door te scannen (via de Scan pagina) of door handmatig een ISBN in te voeren op de Library pagina. Als het boek niet online wordt gevonden, kun je de titel en auteur handmatig invoeren.",
          en: "You can add a book by scanning (via the Scan page) or by manually entering an ISBN on the Library page. If the book is not found online, you can manually enter the title and author.",
        },
        lang
      ),
    },
    {
      q: t(
        {
          nl: "Hoe maak ik een backup?",
          en: "How do I create a backup?",
        },
        lang
      ),
      a: t(
        {
          nl: "Klik op het menu-icoon rechtsboven en selecteer 'Backup maken'. Dit downloadt een JSON-bestand met al je gegevens.",
          en: "Click the menu icon in the top right and select 'Create backup'. This downloads a JSON file with all your data.",
        },
        lang
      ),
    },
    {
      q: t(
        {
          nl: "Hoe zet ik een backup terug?",
          en: "How do I restore a backup?",
        },
        lang
      ),
      a: t(
        {
          nl: "Klik op het menu-icoon rechtsboven en selecteer 'Backup terugzetten'. Selecteer het JSON-bestand dat je eerder hebt gedownload.",
          en: "Click the menu icon in the top right and select 'Restore backup'. Select the JSON file you downloaded earlier.",
        },
        lang
      ),
    },
    {
      q: t(
        {
          nl: "Wat gebeurt er als ik 'Wis alle data' kies?",
          en: "What happens if I choose 'Delete all data'?",
        },
        lang
      ),
      a: t(
        {
          nl: "Dit verwijdert al je boeken, shelves en instellingen van dit apparaat. Dit kan niet ongedaan worden gemaakt. Zorg ervoor dat je eerst een backup maakt als je je gegevens wilt bewaren.",
          en: "This deletes all your books, shelves and settings from this device. This cannot be undone. Make sure to create a backup first if you want to keep your data.",
        },
        lang
      ),
    },
    {
      q: t(
        {
          nl: "Hoe deel ik mijn shelfie?",
          en: "How do I share my shelfie?",
        },
        lang
      ),
      a: t(
        {
          nl: "Op de Library pagina kun je op de 'Deel Shelfie' knop klikken om een afbeelding te genereren die je kunt delen.",
          en: "On the Library page you can click the 'Share Shelfie' button to generate an image you can share.",
        },
        lang
      ),
    },
    {
      q: t(
        {
          nl: "Kan ik mijn gegevens op meerdere apparaten gebruiken?",
          en: "Can I use my data on multiple devices?",
        },
        lang
      ),
      a: t(
        {
          nl: "Je gegevens worden lokaal opgeslagen op elk apparaat. Je kunt een backup maken op het ene apparaat en deze terugzetten op een ander apparaat.",
          en: "Your data is stored locally on each device. You can create a backup on one device and restore it on another device.",
        },
        lang
      ),
    },
  ];

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
        {t({ nl: "Help", en: "Help" }, lang)}
      </h1>

      <div style={{ marginTop: 32 }}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              marginBottom: 24,
              padding: "16px",
              borderRadius: 16,
              background: "var(--panel2)",
              border: "1px solid var(--border)",
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
                color: "var(--text)",
              }}
            >
              {faq.q}
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--muted)",
              }}
            >
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      {/* Contact section */}
      <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--muted)",
            marginBottom: 8,
          }}
        >
          {t(
            {
              nl: "Komen je vragen hier niet aan bod?",
              en: "Can't find your question here?",
            },
            lang
          )}
        </p>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--muted)",
            marginBottom: 4,
          }}
        >
          {t(
            {
              nl: "Neem gerust contact op via:",
              en: "Feel free to contact us at:",
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
      </div>
    </main>
  );
}

