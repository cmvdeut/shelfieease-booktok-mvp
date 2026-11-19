"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { getMood, type Mood } from "@/components/MoodProvider";
import { t, type UiLang } from "@/lib/i18n";
import { useUiLang } from "@/components/UiLangProvider";
import { isProUser } from "@/lib/demo";
import { trackEvent } from "@/lib/analytics";

const headline = {
  nl: "Geen reading-app met een feed. Een tool voor je fysieke plank.",
  en: "Not a reading app with a feed. A tool for your physical shelf.",
};

const subheadline = {
  nl: "Scan je boeken, zie wat je al hebt, en deel in seconden een shelfie of wat je aan het lezen bent — klaar voor BookTok. Geen feed. Geen account. Geen download. Gratis tot 10 boeken.",
  en: "Scan your books, know what you own, and share a shelfie or what you're reading in seconds — ready for BookTok. No feed. No account. No download. Free up to 10 books.",
};

function getHeadlineByMood(_mood: Mood | null, lang: UiLang): string {
  return t(headline, lang);
}

function getSubHeadlineByMood(_mood: Mood | null, lang: UiLang): string {
  return t(subheadline, lang);
}

function ScanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M14 17.5h7M17.5 14v7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ShelfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M7 7v10M12 7v10M17 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M6 10h2M11 10h2M16 10h2M6 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HomePageInner() {
  const searchParams = useSearchParams();
  const utmSource = searchParams.get("utm_source")?.toLowerCase() ?? "";

  const [currentMood, setCurrentMood] = useState<Mood>("light");
  const [isMounted, setIsMounted] = useState(false);
  const [isPro, setIsPro] = useState(() => {
    if (typeof window === "undefined") return false;
    return isProUser();
  });
  const [footerEmail, setFooterEmail] = useState("");
  const [footerEmailStatus, setFooterEmailStatus] = useState<"idle" | "loading" | "done">("idle");

  const { lang } = useUiLang();

  const socialWelcome =
    utmSource === "tiktok"
      ? t({ nl: "Welkom, BookTokker", en: "Welcome, BookTokker" }, lang)
      : utmSource === "instagram"
        ? t({ nl: "Welkom van Instagram", en: "Welcome from Instagram" }, lang)
        : null;

  useEffect(() => {
    setIsMounted(true);
    const initialMood = getMood();
    setCurrentMood(initialMood);
    setIsPro(isProUser());
    trackEvent("landing_view");
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleMoodChange = () => {
      setCurrentMood(getMood());
    };

    window.addEventListener("moodchange", handleMoodChange);

    const intervalId = setInterval(() => {
      const newMood = getMood();
      if (newMood !== currentMood) setCurrentMood(newMood);
      const newProStatus = isProUser();
      if (newProStatus !== isPro) setIsPro(newProStatus);
    }, 100);

    return () => {
      window.removeEventListener("moodchange", handleMoodChange);
      clearInterval(intervalId);
    };
  }, [currentMood, isMounted, isPro]);

  async function handleFooterEmailSubmit() {
    if (!footerEmail.trim() || footerEmailStatus === "loading") return;
    setFooterEmailStatus("loading");
    try {
      await fetch("/api/email-capture", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: footerEmail.trim(), source: "homepage-footer" }),
      });
      trackEvent("email_capture_submit", { source: "homepage-footer" });
    } catch {
      // Silently fail — don't block the user over this
    }
    setFooterEmailStatus("done");
  }

  return (
    <main className="home-page" data-ui-lang={lang} data-mood={currentMood}>
      <div className="home-shell">
        <nav
          className="home-nav"
          aria-label={t({ nl: "Hoofdnavigatie", en: "Primary" }, lang)}
        >
          <Link
            href="/"
            className="home-wordmark"
            aria-label={t({ nl: "ShelfieEase startpagina", en: "ShelfieEase home" }, lang)}
          >
            <img
              src="/brand/v2/logo-mark.png?v=3"
              alt=""
              width={56}
              height={56}
              className="home-logo-mark"
            />
            <span>ShelfieEase</span>
          </Link>
          <Link href="/scan" className="home-nav-action">
            {t({ nl: "Scan een boek", en: "Scan a book" }, lang)}
          </Link>
        </nav>

        <section className="home-hero" aria-labelledby="home-hero-title">
          <div className="home-hero-copy">
            {socialWelcome ? <p className="home-welcome">{socialWelcome}</p> : null}

            <h1 id="home-hero-title">{getHeadlineByMood(currentMood, lang)}</h1>
            <p className="home-lead">{getSubHeadlineByMood(currentMood, lang)}</p>

            <div className="home-actions">
              <Link
                href="/scan"
                className="home-btn-primary"
                onClick={() => trackEvent("cta_start_free_click")}
              >
                <ScanIcon />
                {t({ nl: "Scan een boek", en: "Scan a book" }, lang)}
              </Link>
            </div>
            <div className="home-actions-secondary">
              <Link href="/library" className="home-btn-secondary">
                <ShelfIcon />
                {t({ nl: "Mijn shelf", en: "My Shelf" }, lang)}
              </Link>
              <Link href="/scan" className="home-btn-secondary">
                <KeyboardIcon />
                {t({ nl: "Handmatig", en: "Manual" }, lang)}
              </Link>
            </div>

            <p className="home-price-note">
              {t(
                {
                  nl: "Minder dan één dubbele aankoop — €4,99 eenmalig",
                  en: "Less than the cost of one duplicate purchase — €4.99 one-time",
                },
                lang
              )}
            </p>
            <p className="home-manual-note">
              {t(
                {
                  nl: "Handmatig invoeren blijft altijd mogelijk.",
                  en: "Manual entry is always possible.",
                },
                lang
              )}
            </p>

            <div className="home-legal-row">
              <Link href="/privacy">
                {t({ nl: "Privacybeleid", en: "Privacy Policy" }, lang)}
              </Link>
              <Link href="/terms">
                {t({ nl: "Gebruiksvoorwaarden", en: "Terms of Service" }, lang)}
              </Link>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-phone">
              <Image
                src="/screenshots/v2/ontdek-scan.png"
                alt={t(
                  {
                    nl: "ShelfieEase scan-scherm op telefoon",
                    en: "ShelfieEase scan screen on phone",
                  },
                  lang
                )}
                width={390}
                height={844}
                priority
              />
            </div>
            <p className="home-caption">
              {t(
                {
                  nl: "Scan · Shelf · Deel — in je browser",
                  en: "Scan · Shelf · Share — in your browser",
                },
                lang
              )}
            </p>
          </div>
        </section>

        {!isPro && (
          <aside className="home-demo">
            <strong>{t({ nl: "Let op", en: "Please note" }, lang)}</strong>
            <p>
              {t(
                {
                  nl: "ShelfieEase werkt op de meeste moderne telefoons, maar niet elke camera of barcode wordt even goed ondersteund. Daarom kun je de app eerst in demo gebruiken — zo weet je zeker of het voor jouw toestel prettig werkt.",
                  en: "The demo helps you test whether scanning works well on your device, as camera quality and barcode formats can vary.",
                },
                lang
              )}
            </p>
            <p>
              {t(
                {
                  nl: "Demo-versie · max. 10 boeken",
                  en: "Demo version · max. 10 books",
                },
                lang
              )}
            </p>
          </aside>
        )}

        {!isPro && (
          <p className="home-unlock home-unlock-block">
            {t({ nl: "Unlock onbeperkt:", en: "Unlock unlimited:" }, lang)}{" "}
            <Link href="/library">
              €4,99 {t({ nl: "eenmalig", en: "one-time" }, lang)}
            </Link>
          </p>
        )}

        <section className="home-moments" aria-label={t({ nl: "Zo werkt het", en: "How it works" }, lang)}>
          <article className="home-moment">
            <figure>
              <Image
                src="/screenshots/v2/ontdek-scan.png"
                alt={t({ nl: "Barcode scannen", en: "Scanning a barcode" }, lang)}
                width={390}
                height={844}
              />
            </figure>
            <h2>{t({ nl: "Scan de barcode", en: "Scan the barcode" }, lang)}</h2>
            <p>
              {t(
                {
                  nl: "In de winkel of thuis. We checken of hij al op je plank staat.",
                  en: "In the store or at home. We check if it is already on your shelf.",
                },
                lang
              )}
            </p>
          </article>

          <article className="home-moment">
            <figure>
              <Image
                src="/screenshots/v2/book-detail.png"
                alt={t({ nl: "Boekresultaat met status", en: "Book result with status" }, lang)}
                width={390}
                height={844}
              />
            </figure>
            <h2>{t({ nl: "Zie het resultaat", en: "See the result" }, lang)}</h2>
            <p>
              {t(
                {
                  nl: "Al op je plank? Meteen duidelijk. Geen gokwerk meer.",
                  en: "Already on your shelf? Instantly clear. No more guessing.",
                },
                lang
              )}
            </p>
          </article>

          <article className="home-moment">
            <figure>
              <Image
                src="/screenshots/v2/library-plank.png"
                alt={t({ nl: "TBR Bezig Gelezen overzicht", en: "TBR Reading Finished overview" }, lang)}
                width={390}
                height={844}
              />
            </figure>
            <h2>{t({ nl: "Houd je TBR bij", en: "Track your TBR" }, lang)}</h2>
            <p>
              {t(
                {
                  nl: "TBR, Bezig en Gelezen op één plek. Klaar voor een shelfie.",
                  en: "TBR, Reading and Finished in one place. Ready for a shelfie.",
                },
                lang
              )}
            </p>
          </article>
        </section>

        <section className="home-features">
          <h2>{t({ nl: "Wat je krijgt", en: "What you get" }, lang)}</h2>
          <ul className="home-feature-list">
            <li>
              <h3>
                {t({ nl: "Rustige leesstatistieken", en: "No-stress reading stats" }, lang)}
              </h3>
              <p>
                {t({ nl: "TBR · Bezig · Gelezen", en: "TBR · Reading · Finished" }, lang)}
              </p>
            </li>
            <li>
              <h3>{t({ nl: "Emoji-planken", en: "Emoji shelves" }, lang)}</h3>
              <p>
                {t({ nl: "Maak mini-collecties", en: "Create mini collections" }, lang)}
              </p>
            </li>
            <li>
              <h3>{t({ nl: "Deel je shelfie", en: "Share your Shelfie" }, lang)}</h3>
              <p>
                {t({ nl: "9:16 deelkaart", en: "9:16 share card" }, lang)}
              </p>
            </li>
          </ul>
        </section>

        <section className="home-footer home-updates" aria-labelledby="home-updates-title">
          <h2 id="home-updates-title">
            {t({ nl: "Blijf op de hoogte van nieuwe features", en: "Get notified about new features" }, lang)}
          </h2>
          {footerEmailStatus === "done" ? (
            <p className="home-thanks">
              {t({ nl: "Bedankt! We houden je op de hoogte.", en: "Thanks! We'll keep you posted." }, lang)}
            </p>
          ) : (
            <form
              className="home-email-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleFooterEmailSubmit();
              }}
            >
              <input
                type="email"
                name="email"
                id="homepage-footer-email"
                required
                autoComplete="email"
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                placeholder={t({ nl: "jouw@email.nl", en: "your@email.com" }, lang)}
                aria-label={t({ nl: "E-mailadres", en: "Email address" }, lang)}
              />
              <button type="submit" disabled={footerEmailStatus === "loading"}>
                {footerEmailStatus === "loading" ? "…" : t({ nl: "Aanmelden", en: "Sign up" }, lang)}
              </button>
            </form>
          )}
        </section>

        <footer className="home-footer">
          <div className="home-social">
            <a
              href="https://www.tiktok.com/@shelfieease"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t({ nl: "ShelfieEase op TikTok", en: "ShelfieEase on TikTok" }, lang)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
              </svg>
              TikTok
            </a>
            <a
              href="https://www.instagram.com/shelfieease/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t({ nl: "ShelfieEase op Instagram", en: "ShelfieEase on Instagram" }, lang)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
              Instagram
            </a>
          </div>

          <p className="home-credit">
            {t(
              {
                nl: "Met liefde gemaakt voor boekliefhebbers",
                en: "Built with love for book lovers",
              },
              lang
            )}
          </p>

          <nav
            className="home-guides"
            aria-label={t({ nl: "Productgidsen", en: "Product guides" }, lang)}
          >
            <Link href="/booktok-shelf-tracker">
              {t({ nl: "BookTok tracker", en: "BookTok tracker" }, lang)}
            </Link>
            <Link href="/reading-tracker">
              {t({ nl: "Reading tracker", en: "Reading tracker" }, lang)}
            </Link>
            <Link href="/goodreads-alternative">
              {t({ nl: "Goodreads-alternatief", en: "Goodreads alternative" }, lang)}
            </Link>
            <Link href="/storygraph-alternative">
              {t({ nl: "StoryGraph-alternatief", en: "StoryGraph alternative" }, lang)}
            </Link>
            <Link href="/isbn-book-scanner">
              {t({ nl: "ISBN-scanner", en: "ISBN scanner" }, lang)}
            </Link>
            <Link href="/boektok">BoekTok</Link>
          </nav>

          <div className="home-footer-legal">
            <a href="/privacy">
              {t({ nl: "Privacybeleid", en: "Privacy policy" }, lang)}
            </a>
            <a href="/terms">
              {t({ nl: "Gebruiksvoorwaarden", en: "Terms of service" }, lang)}
            </a>
          </div>
        </footer>

        <section className="home-close" aria-label={t({ nl: "Beginnen", en: "Get started" }, lang)}>
          <h2>{t({ nl: "Klaar om te scannen?", en: "Ready to scan?" }, lang)}</h2>
          <p className="home-lead">
            {t(
              {
                nl: "Open de scanner in je browser. Geen download. Geen account.",
                en: "Open the scanner in your browser. No download. No account.",
              },
              lang
            )}
          </p>
          <Link href="/scan" className="home-btn-secondary">
            <ScanIcon />
            {t({ nl: "Scan een boek", en: "Scan a book" }, lang)}
          </Link>
        </section>
      </div>
    </main>
  );
}

export default function HomePageClient() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  );
}
