"use client";

import { t, type UiLang } from "@/lib/i18n";
import { HomeScanPhoneMock } from "@/components/HomeScanPhoneMock";

type Props = { lang: UiLang };

export function HomeScanMomentMock({ lang }: Props) {
  return <HomeScanPhoneMock lang={lang} className="home-moment-phone" />;
}

export function HomeResultMomentMock({ lang }: Props) {
  return (
    <div className="home-phone-mock home-moment-phone" aria-hidden="true">
      <div className="home-phone-mock__chrome">
        <p className="home-phone-mock__eyebrow">
          {t({ nl: "Resultaat", en: "Result" }, lang)}
        </p>
        <h3 className="home-phone-mock__title">
          {t({ nl: "Al op je plank?", en: "Already on your shelf?" }, lang)}
        </h3>
        <div className="home-phone-mock__card">
          <div className="home-phone-mock__cover" />
          <div className="home-phone-mock__card-copy">
            <strong>{t({ nl: "Gevonden", en: "Found" }, lang)}</strong>
            <span>{t({ nl: "Status: Bezig", en: "Status: Reading" }, lang)}</span>
          </div>
        </div>
        <p className="home-phone-mock__body">
          {t(
            {
              nl: "Meteen duidelijk. Geen gokwerk meer.",
              en: "Instantly clear. No more guessing.",
            },
            lang
          )}
        </p>
      </div>
    </div>
  );
}

export function HomeLibraryMomentMock({ lang }: Props) {
  return (
    <div className="home-phone-mock home-moment-phone" aria-hidden="true">
      <div className="home-phone-mock__chrome">
        <p className="home-phone-mock__eyebrow">
          {t({ nl: "Jouw plank", en: "Your shelf" }, lang)}
        </p>
        <h3 className="home-phone-mock__title">
          {t({ nl: "TBR · Bezig · Gelezen", en: "TBR · Reading · Finished" }, lang)}
        </h3>
        <div className="home-phone-mock__stats">
          <div>
            <strong>12</strong>
            <span>TBR</span>
          </div>
          <div>
            <strong>3</strong>
            <span>{t({ nl: "Bezig", en: "Reading" }, lang)}</span>
          </div>
          <div>
            <strong>48</strong>
            <span>{t({ nl: "Gelezen", en: "Finished" }, lang)}</span>
          </div>
        </div>
        <div className="home-phone-mock__shelf-row">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
