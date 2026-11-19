"use client";

import { t, type UiLang } from "@/lib/i18n";

type HomeScanPhoneMockProps = {
  lang: UiLang;
  className?: string;
};

/** Live phone preview so homepage mock always matches NL/EN (no baked-in screenshot text). */
export function HomeScanPhoneMock({ lang, className }: HomeScanPhoneMockProps) {
  return (
    <div className={className ? `home-phone-mock ${className}` : "home-phone-mock"} aria-hidden="true">
      <div className="home-phone-mock__chrome">
        <div className="home-phone-mock__status">
          <span>9:41</span>
          <span className="home-phone-mock__notch" />
          <span>●●●</span>
        </div>

        <p className="home-phone-mock__eyebrow">
          {t({ nl: "Op je plank", en: "On your shelf" }, lang)}
        </p>
        <h3 className="home-phone-mock__title">
          {t({ nl: "Scan je boek", en: "Scan your book" }, lang)}
        </h3>
        <p className="home-phone-mock__body">
          {t(
            {
              nl: "Richt op de barcode. We checken of hij al op je plank staat.",
              en: "Point at the barcode. We'll check if it's already on your shelf.",
            },
            lang
          )}
        </p>

        <div className="home-phone-mock__scanner">
          <div className="home-phone-mock__viewfinder" />
        </div>

        <p className="home-phone-mock__link">
          {t({ nl: "Liever ISBN typen?", en: "Prefer typing the ISBN?" }, lang)}
        </p>
        <p className="home-phone-mock__demo">
          {t({ nl: "Demo · max. 10 boeken", en: "Demo · max. 10 books" }, lang)}
        </p>
      </div>

      <nav className="home-phone-mock__nav">
        <span>{t({ nl: "Mijn Plank", en: "My Shelf" }, lang)}</span>
        <span>{t({ nl: "Lezen", en: "Reading" }, lang)}</span>
        <span className="is-active">{t({ nl: "Ontdek", en: "Discover" }, lang)}</span>
        <span>{t({ nl: "Profiel", en: "Profile" }, lang)}</span>
      </nav>
    </div>
  );
}
