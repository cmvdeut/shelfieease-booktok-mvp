"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";
import { useUiLang } from "@/components/UiLangProvider";

const LOGO_SRC = "/brand/v2/logo-mark.png?v=3";

type BrandMarkProps = {
  /** When true, always render (e.g. embedded in a page header). */
  force?: boolean;
  size?: number;
  withLabel?: boolean;
  className?: string;
};

/**
 * Global ShelfieEase mark. Fixed top-left in the app shell on every route
 * except `/`, where the homepage nav already shows the logo.
 */
export function BrandMark({
  force = false,
  size = 40,
  withLabel = false,
  className,
}: BrandMarkProps) {
  const pathname = usePathname();
  const { lang } = useUiLang();
  const isHome = pathname === "/";
  const homeLabel = t({ nl: "ShelfieEase startpagina", en: "ShelfieEase home" }, lang);

  if (!force && isHome) return null;

  const mark = (
    <>
      <img
        src={LOGO_SRC}
        alt=""
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          display: "block",
          flexShrink: 0,
        }}
      />
      {withLabel ? (
        <span
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontWeight: 700,
            fontSize: 16,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          ShelfieEase
        </span>
      ) : null}
    </>
  );

  if (force) {
    return (
      <Link
        href="/"
        className={className}
        aria-label={homeLabel}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {mark}
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label={homeLabel}
      className={className}
      style={{
        position: "fixed",
        top: "calc(12px + env(safe-area-inset-top, 0px))",
        left: 12,
        zIndex: 1000,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size + 8,
        height: size + 8,
        borderRadius: 14,
        background: "var(--panel)",
        border: "1px solid var(--border)",
        boxShadow: "0 2px 8px var(--shadow)",
        textDecoration: "none",
        padding: 4,
        boxSizing: "border-box",
      }}
    >
      {mark}
    </Link>
  );
}
