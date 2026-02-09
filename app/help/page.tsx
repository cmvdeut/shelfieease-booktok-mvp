"use client";

import Link from "next/link";
import React from "react";
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
          nl: "Waarom werkt scannen niet voor elk boek?",
          en: "Why doesn't scanning work for every book?",
        },
        lang
      ),
      a: (
        <div>
          <p style={{ marginBottom: 12 }}>
            {t(
              {
                nl: "De meeste boeken kunnen snel worden gescand met hun ISBN-barcode. Sommige gedrukte barcodes zijn echter moeilijk of onmogelijk te scannen.",
                en: "Most books can be scanned quickly using their ISBN barcode. However, some printed barcodes are difficult or impossible to scan.",
              },
              lang
            )}
          </p>
          <p style={{ marginBottom: 8 }}>
            {t(
              {
                nl: "Dit gebeurt meestal wanneer een barcode:",
                en: "This usually happens when a barcode:",
              },
              lang
            )}
          </p>
          <ul style={{ marginLeft: 20, marginBottom: 12, paddingLeft: 0 }}>
            <li style={{ marginBottom: 4 }}>
              {t(
                {
                  nl: "gedrukt is met zeer dunne lijnen",
                  en: "is printed with very thin lines",
                },
                lang
              )}
            </li>
            <li style={{ marginBottom: 4 }}>
              {t(
                {
                  nl: "lage contrast heeft (bijvoorbeeld grijs of bruin papier)",
                  en: "has low contrast (for example grey or brown paper)",
                },
                lang
              )}
            </li>
            <li style={{ marginBottom: 4 }}>
              {t(
                {
                  nl: "te klein is of zeer dicht bij de rand staat",
                  en: "is too small or placed very close to the edge",
                },
                lang
              )}
            </li>
            <li style={{ marginBottom: 4 }}>
              {t(
                {
                  nl: "licht beschadigd of versleten is",
                  en: "is slightly damaged or worn",
                },
                lang
              )}
            </li>
          </ul>
          <p style={{ marginBottom: 12 }}>
            {t(
              {
                nl: "In deze gevallen kunnen zelfs moderne telefooncamera's de barcode mogelijk niet betrouwbaar lezen.",
                en: "In these cases, even modern phone cameras may not be able to read the barcode reliably.",
              },
              lang
            )}
          </p>
          <p style={{ marginBottom: 8, fontWeight: 600 }}>
            {t(
              {
                nl: "Wat kan ik doen als scannen mislukt?",
                en: "What can I do if scanning fails?",
              },
              lang
            )}
          </p>
          <ul style={{ marginLeft: 20, marginBottom: 12, paddingLeft: 0 }}>
            <li style={{ marginBottom: 4 }}>
              {t(
                {
                  nl: "Probeer te scannen in beter licht",
                  en: "Try scanning in better light",
                },
                lang
              )}
            </li>
            <li style={{ marginBottom: 4 }}>
              {t(
                {
                  nl: "Houd je telefoon iets verder weg",
                  en: "Hold your phone a little further away",
                },
                lang
              )}
            </li>
            <li style={{ marginBottom: 4 }}>
              {t(
                {
                  nl: "Of voer het ISBN gewoon handmatig in — dit werkt altijd",
                  en: "Or simply enter the ISBN manually — this always works",
                },
                lang
              )}
            </li>
          </ul>
          <p style={{ marginTop: 12, fontStyle: "italic" }}>
            {t(
              {
                nl: "ShelfieEase zal je nooit blokkeren om een boek toe te voegen.",
                en: "ShelfieEase will never block you from adding a book.",
              },
              lang
            )}
          </p>
        </div>
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
          nl: "Kan ik de app installeren na betaling?",
          en: "Install app after payment",
        },
        lang
      ),
      a: t(
        {
          nl: "Ja. Na het ontgrendelen van de full version (betaling of promocode) kun je de app op je telefoon of desktop installeren voor snelle toegang vanaf je startscherm. Je kunt de full version ook gewoon online in de browser blijven gebruiken — installeren is optioneel.",
          en: "Yes. After unlocking the full version (payment or promo code), you can install the app on your phone or desktop for quick access from your home screen. You can also keep using the full version online in your browser — installing is optional.",
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
            {typeof faq.a === "string" ? (
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--muted)",
                }}
              >
                {faq.a}
              </p>
            ) : (
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--muted)",
                }}
              >
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer / Contact section */}
      <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 4 }}>
          Built with love for book lovers 📚
        </p>
        <p style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 24 }}>
          Have ideas or feedback? We&apos;d love to hear from you.
        </p>
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

