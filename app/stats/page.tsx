"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { loadBooks, loadShelves, normalizeStatus, setActiveShelfId, type Book, type Shelf, type BookStatus, type BookFormat } from "@/lib/storage";
import { detectUiLang, t, isNlUi } from "@/lib/i18n";
import { getMood, type Mood as DocumentMood } from "@/components/MoodProvider";

function statusPillStyle(status: BookStatus, mood: DocumentMood): React.CSSProperties {
  const isCalm = mood === "calm";
  
  if (status === "TBR") {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      marginLeft: 0,
      cursor: "default",
      background: isCalm ? "rgba(90, 62, 99, 0.14)" : "rgba(165,120,255,0.14)",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: isCalm ? "rgba(90, 62, 99, 0.28)" : "rgba(165,120,255,0.28)",
      color: isCalm ? "#5A3E63" : "#CFC2FF",
      userSelect: "none",
    };
  } else if (status === "Reading") {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      marginLeft: 0,
      cursor: "default",
      background: isCalm ? "rgba(47, 90, 79, 0.14)" : "rgba(100,220,190,0.14)",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: isCalm ? "rgba(47, 90, 79, 0.28)" : "rgba(100,220,190,0.28)",
      color: isCalm ? "#2F5A4F" : "#BDF3E6",
      userSelect: "none",
    };
  } else {
    // Finished/Read
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      marginLeft: 0,
      cursor: "default",
      background: isCalm ? "rgba(90, 61, 31, 0.14)" : "rgba(228,192,140,0.14)",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: isCalm ? "rgba(90, 61, 31, 0.28)" : "rgba(228,192,140,0.28)",
      color: isCalm ? "#5A3D1F" : "#F3D9B3",
      userSelect: "none",
    };
  }
}

function statusLabel(status: BookStatus, nl: boolean): string {
  if (status === "TBR") return "TBR";
  if (status === "Reading") return nl ? "Bezig" : "Reading";
  return nl ? "Gelezen" : "Read";
}

function statusColor(status: BookStatus, isCalm: boolean): string {
  if (status === "TBR") {
    return isCalm ? "rgba(90, 62, 99, 0.14)" : "rgba(165,120,255,0.14)";
  } else if (status === "Reading") {
    return isCalm ? "rgba(47, 90, 79, 0.14)" : "rgba(100,220,190,0.14)";
  } else {
    return isCalm ? "rgba(90, 61, 31, 0.14)" : "rgba(228,192,140,0.14)";
  }
}

export default function StatsPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [currentMood, setCurrentMood] = useState<DocumentMood>("default");
  const [isMounted, setIsMounted] = useState(false);
  const lang = detectUiLang();
  const nl = isNlUi();
  const isCalm = currentMood === "calm";

  useEffect(() => {
    setIsMounted(true);
    const initialMood = getMood();
    setCurrentMood(initialMood);
    
    // Use exact same data source as library page
    const loadedBooks = loadBooks();
    const loadedShelves = loadShelves();
    setBooks(loadedBooks);
    setShelves(loadedShelves);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const handleMoodChange = () => {
      const newMood = getMood();
      setCurrentMood(newMood);
    };
    
    window.addEventListener("moodchange", handleMoodChange);
    
    const intervalId = setInterval(() => {
      const newMood = getMood();
      if (newMood !== currentMood) {
        setCurrentMood(newMood);
      }
    }, 100);
    
    return () => {
      window.removeEventListener("moodchange", handleMoodChange);
      clearInterval(intervalId);
    };
  }, [currentMood, isMounted]);

  const stats = useMemo(() => {
    const total = books.length;
    
    const statusCounts = {
      TBR: 0,
      Reading: 0,
      Finished: 0,
    };
    
    const formatCounts = {
      physical: 0,
      ebook: 0,
    };
    
    const shelfCounts: Record<string, { shelf: Shelf; count: number }> = {};
    
    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let recentlyAdded = 0;
    
    books.forEach((book) => {
      // Use centralized normalizeStatus to ensure consistent counting
      const status = normalizeStatus(book.status);
      statusCounts[status]++;
      
      const format = book.format || "physical";
      formatCounts[format]++;
      
      // Check if book was added in last 7 days (use addedAt if available)
      const addedAt = book.addedAt || book.updatedAt || 0;
      if (addedAt > sevenDaysAgo) {
        recentlyAdded++;
      }
      
      const shelf = shelves.find((s) => s.id === book.shelfId);
      if (shelf) {
        if (!shelfCounts[shelf.id]) {
          shelfCounts[shelf.id] = { shelf, count: 0 };
        }
        shelfCounts[shelf.id].count++;
      }
    });
    
    // Largest shelf
    const largestShelf = Object.values(shelfCounts)
      .sort((a, b) => b.count - a.count)[0];
    
    return {
      total,
      statusCounts,
      formatCounts,
      totalShelves: shelves.length,
      largestShelf,
      recentlyAdded,
    };
  }, [books, shelves]);

  const handleLargestShelfClick = () => {
    if (!stats.largestShelf) return;
    // Set active shelf and navigate to library
    setActiveShelfId(stats.largestShelf.shelf.id);
    router.push("/library");
  };

  if (!isMounted) {
    return null;
  }

  const statusTotal = stats.statusCounts.TBR + stats.statusCounts.Reading + stats.statusCounts.Finished;
  const tbrPercent = statusTotal > 0 ? Math.round((stats.statusCounts.TBR / statusTotal) * 100) : 0;
  const readingPercent = statusTotal > 0 ? Math.round((stats.statusCounts.Reading / statusTotal) * 100) : 0;
  const finishedPercent = statusTotal > 0 ? Math.round((stats.statusCounts.Finished / statusTotal) * 100) : 0;

  const formatTotal = stats.formatCounts.physical + stats.formatCounts.ebook;
  const physicalPercent = formatTotal > 0 ? Math.round((stats.formatCounts.physical / formatTotal) * 100) : 0;
  const ebookPercent = formatTotal > 0 ? Math.round((stats.formatCounts.ebook / formatTotal) * 100) : 0;

  return (
    <div style={page}>
      <div style={header}>
        <Link href="/library" style={backLink}>
          ← {t({ nl: "Bibliotheek", en: "Library" }, lang)}
        </Link>
        <h1 style={title}>{t({ nl: "Statistieken", en: "Statistics" }, lang)}</h1>
        <p style={subtitle}>{t({ nl: "Rustig overzicht van je shelf.", en: "A calm overview of your shelf." }, lang)}</p>
      </div>

      <div style={content}>
        {/* Total Books */}
        <div style={card}>
          <div style={cardLabel}>{t({ nl: "Totaal boeken", en: "Total books" }, lang)}</div>
          <div style={cardValue}>{stats.total}</div>
        </div>

        {/* Largest Shelf - clickable */}
        <div style={card}>
          <div style={cardLabel}>{t({ nl: "Grootste shelf", en: "Largest shelf" }, lang)}</div>
          {stats.largestShelf ? (
            <button
              type="button"
              onClick={handleLargestShelfClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleLargestShelfClick();
                }
              }}
              onFocus={(e) => {
                // Only show outline for keyboard navigation (focus-visible)
                const isKeyboardFocus = e.currentTarget.matches(":focus-visible");
                if (isKeyboardFocus) {
                  e.currentTarget.style.outline = "2px solid var(--accent1)";
                  e.currentTarget.style.outlineOffset = "2px";
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              style={largestShelfButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--panel2)";
                e.currentTarget.style.borderColor = "var(--borderStrong)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--btnGhostBg)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <span style={largestShelfEmoji}>{stats.largestShelf.shelf.emoji}</span>
              <div style={largestShelfInfo}>
                <div style={largestShelfName}>{stats.largestShelf.shelf.name}</div>
                <div style={largestShelfCount}>
                  {stats.largestShelf.count} {t({ nl: "boeken", en: "books" }, lang)}
                </div>
              </div>
            </button>
          ) : (
            <div style={emptyState}>
              {t({ nl: "Nog geen shelves met boeken", en: "No shelves with books yet" }, lang)}
            </div>
          )}
        </div>

        {/* Status Distribution with horizontal bar and percentages */}
        <div style={card}>
          <div style={cardLabel}>{t({ nl: "Statusverdeling", en: "Status distribution" }, lang)}</div>
          
          {/* Horizontal distribution bar */}
          <div style={getDistributionBarContainer(isCalm)}>
            {stats.statusCounts.TBR > 0 && (
              <div
                style={{
                  ...distributionSegment,
                  width: `${tbrPercent}%`,
                  background: statusColor("TBR", isCalm),
                }}
              />
            )}
            {stats.statusCounts.Reading > 0 && (
              <div
                style={{
                  ...distributionSegment,
                  width: `${readingPercent}%`,
                  background: statusColor("Reading", isCalm),
                }}
              />
            )}
            {stats.statusCounts.Finished > 0 && (
              <div
                style={{
                  ...distributionSegment,
                  width: `${finishedPercent}%`,
                  background: statusColor("Finished", isCalm),
                }}
              />
            )}
          </div>

          {/* Status counts with percentages - using label pills */}
          <div style={statusList}>
            {(["TBR", "Reading", "Finished"] as BookStatus[]).map((status) => {
              const count = stats.statusCounts[status];
              const percent = status === "TBR" ? tbrPercent : status === "Reading" ? readingPercent : finishedPercent;
              return (
                <div key={status} style={statusItem}>
                  <span style={statusPillStyle(status, currentMood)}>
                    {statusLabel(status, nl)}
                  </span>
                  <div style={statusInfo}>
                    <span style={statusCount}>{count}</span>
                    {statusTotal > 0 && (
                      <span style={statusPercent}>{percent}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formats with percentages */}
        <div style={card}>
          <div style={cardLabel}>{t({ nl: "Formaten", en: "Formats" }, lang)}</div>
          <div style={formatGrid}>
            <div style={getFormatItem(isCalm)}>
              <div style={formatEmoji}>📖</div>
              <div style={formatInfo}>
                <div style={formatLabel}>{t({ nl: "Fysiek", en: "Physical" }, lang)}</div>
                <div style={formatCountRow}>
                  <span style={formatCount}>{stats.formatCounts.physical}</span>
                  {formatTotal > 0 && (
                    <span style={formatPercent}>{physicalPercent}%</span>
                  )}
                </div>
              </div>
            </div>
            <div style={getFormatItem(isCalm)}>
              <div style={formatEmoji}>📱</div>
              <div style={formatInfo}>
                <div style={formatLabel}>{t({ nl: "E-book", en: "E-book" }, lang)}</div>
                <div style={formatCountRow}>
                  <span style={formatCount}>{stats.formatCounts.ebook}</span>
                  {formatTotal > 0 && (
                    <span style={formatPercent}>{ebookPercent}%</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentlyAdded > 0 && (
          <div style={card}>
            <div style={cardLabel}>
              {t({ nl: "Recent toegevoegd", en: "Recently added" }, lang)}
            </div>
            <div style={recentActivityContainer}>
              <div style={recentActivityValue}>{stats.recentlyAdded}</div>
              <div style={recentActivityLabel}>
                {t({ nl: "Toegevoegd in de afgelopen 7 dagen", en: "Added in the last 7 days" }, lang)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  padding: "20px 16px",
  maxWidth: 800,
  margin: "0 auto",
  backgroundColor: "var(--bg)",
};

const header: React.CSSProperties = {
  marginBottom: 24,
};

const backLink: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 12,
  color: "var(--muted)",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
  transition: "color 0.2s ease",
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 32,
  fontWeight: 950,
  color: "var(--text)",
  lineHeight: 1.2,
};

const subtitle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  fontWeight: 600,
  color: "var(--muted)",
  lineHeight: 1.4,
};

const content: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const card: React.CSSProperties = {
  padding: 20,
  borderRadius: 20,
  border: "1px solid var(--border)",
  background: "var(--panel)",
  boxShadow: "0 8px 24px var(--shadow)",
};

const cardLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 16,
};

const cardValue: React.CSSProperties = {
  fontSize: 48,
  fontWeight: 950,
  color: "var(--text)",
  lineHeight: 1,
};

const getDistributionBarContainer = (isCalm: boolean): React.CSSProperties => ({
  width: "100%",
  height: 8,
  borderRadius: 999,
  background: isCalm 
    ? "rgba(58, 42, 26, 0.08)" 
    : "rgba(255,255,255,0.08)",
  display: "flex",
  overflow: "hidden",
  marginBottom: 16,
});

const distributionSegment: React.CSSProperties = {
  height: "100%",
  transition: "width 0.3s ease",
  minWidth: "2px",
};

const statusList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const statusItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const statusInfo: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const statusCount: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "var(--text)",
};

const statusPercent: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--muted2)",
};

const formatGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const getFormatItem = (isCalm: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 12,
  borderRadius: 16,
  background: isCalm
    ? "rgba(58, 42, 26, 0.06)"
    : "rgba(255,255,255,0.04)",
  border: "1px solid var(--border)",
});

const formatEmoji: React.CSSProperties = {
  fontSize: 24,
  lineHeight: 1,
};

const formatInfo: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  flex: 1,
};

const formatLabel: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text)",
};

const formatCountRow: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 8,
};

const formatCount: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 950,
  color: "var(--text)",
  lineHeight: 1,
};

const formatPercent: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--muted2)",
};

const largestShelfButton: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 16,
  borderRadius: 16,
  background: "var(--btnGhostBg)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "var(--border)",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "inherit",
  fontSize: "inherit",
  color: "inherit",
  transition: "background 0.2s ease, border-color 0.2s ease",
  outline: "none",
};

// Add focus-visible style via inline style with onFocus/onBlur or CSS
// For now, we'll handle it in the component with onFocus/onBlur

const largestShelfEmoji: React.CSSProperties = {
  fontSize: 32,
  lineHeight: 1,
};

const largestShelfInfo: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  flex: 1,
};

const largestShelfName: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "var(--text)",
  lineHeight: 1.2,
};

const largestShelfCount: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--muted)",
};

const recentActivityContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  alignItems: "center",
  padding: 16,
  borderRadius: 16,
  background: "var(--btnGhostBg)",
  border: "1px solid var(--border)",
};

const recentActivityValue: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 950,
  color: "var(--text)",
  lineHeight: 1,
};

const recentActivityLabel: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--muted)",
  textAlign: "center",
};

const emptyState: React.CSSProperties = {
  fontSize: 14,
  color: "var(--muted)",
  fontStyle: "italic",
  padding: 16,
  textAlign: "center",
};
