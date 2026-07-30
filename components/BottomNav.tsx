"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useUiLang } from "@/components/UiLangProvider";

const tabs = [
  {
    href: "/library",
    id: "plank",
    labelNl: "Mijn Plank",
    labelEn: "My Shelf",
    icon: "📚",
  },
  {
    href: "/library?focus=reading",
    id: "lezen",
    labelNl: "Lezen",
    labelEn: "Reading",
    icon: "📖",
  },
  {
    href: "/scan",
    id: "ontdek",
    labelNl: "Ontdek",
    labelEn: "Discover",
    icon: "🧭",
  },
  {
    href: "/stats",
    id: "profiel",
    labelNl: "Profiel",
    labelEn: "Profile",
    icon: "👤",
  },
] as const;

function activeTab(pathname: string, focus: string | null): (typeof tabs)[number]["id"] {
  if (pathname.startsWith("/scan")) return "ontdek";
  if (pathname.startsWith("/stats") || pathname.startsWith("/statistics")) return "profiel";
  if (pathname.startsWith("/library") && focus === "reading") return "lezen";
  if (pathname.startsWith("/library") || pathname === "/") return "plank";
  return "plank";
}

/** Hide on marketing/legal pages where chrome should stay minimal */
function shouldHide(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/privacy") || pathname.startsWith("/terms")) return true;
  if (pathname.startsWith("/booktok") || pathname.startsWith("/boektok")) return true;
  if (pathname.startsWith("/goodreads") || pathname.startsWith("/isbn")) return true;
  return false;
}

export function BottomNav() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const focus = searchParams?.get("focus") ?? null;
  const { lang } = useUiLang();
  const nl = lang === "nl";

  if (shouldHide(pathname)) return null;

  const current = activeTab(pathname, focus);

  return (
    <nav
      aria-label={nl ? "Hoofdnavigatie" : "Main navigation"}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 80,
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        paddingTop: 8,
        paddingLeft: 12,
        paddingRight: 12,
        background: "color-mix(in srgb, var(--panelSolid) 88%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 4,
        }}
      >
        {tabs.map((tab) => {
          const active = current === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 4px",
                borderRadius: 999,
                textDecoration: "none",
                color: active ? "var(--accent1)" : "var(--muted)",
                background: active ? "var(--accentSoft2)" : "transparent",
                fontSize: 11,
                fontWeight: active ? 700 : 600,
                fontFamily: "var(--font-body), system-ui, sans-serif",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>
                {tab.icon}
              </span>
              <span>{nl ? tab.labelNl : tab.labelEn}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
