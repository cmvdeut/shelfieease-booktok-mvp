"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { loadBooks, loadShelves, type Book, type Shelf, type BookStatus, type BookFormat } from "@/lib/storage";
import { detectUiLang, t } from "@/lib/i18n";
import { getMood, type Mood as DocumentMood } from "@/components/MoodProvider";

function statusColor(status: BookStatus, isCalm: boolean): string {
  if (status === "TBR") {
    return isCalm ? "rgba(140,120,255,0.15)" : "rgba(140,120,255,0.18)";
  } else if (status === "Reading") {
    return isCalm ? "rgba(80,180,200,0.15)" : "rgba(80,180,200,0.18)";
  } else {
    return isCalm ? "rgba(120,160,120,0.15)" : "rgba(120,160,120,0.18)";
  }
}

function statusLabel(status: BookStatus, lang: "nl" | "en"): string {
  if (status === "TBR") return t({ nl: "TBR", en: "TBR" }, lang);
  if (status === "Reading") return t({ nl: "Bezig", en: "Reading" }, lang);
  return t({ nl: "Gelezen", en: "Read" }, lang);
}

export default function StatisticsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [currentMood, setCurrentMood] = useState<DocumentMood>("default");
  const [isMounted, setIsMounted] = useState(false);
  const lang = detectUiLang();
  const isCalm = currentMood === "calm";

  useEffect(() => {
    setIsMounted(true);
    const initialMood = getMood();
    setCurrentMood(initialMood);
    
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
    
    books.forEach((book) => {
      const status = book.status || "TBR";
      if (status === "TBR" || status === "Reading" || status === "Finished") {
        statusCounts[status]++;
      }
      
      const format = book.format || "physical";
      formatCounts[format]++;
      
      const shelf = shelves.find((s) => s.id === book.shelfId);
      if (shelf) {
        if (!shelfCounts[shelf.id]) {
          shelfCounts[shelf.id] = { shelf, count: 0 };
        }
        shelfCounts[shelf.id].count++;
      }
    });
    
    return {
      total,
      statusCounts,
      formatCounts,
      shelfCounts: Object.values(shelfCounts).sort((a, b) => b.count - a.count),
    };
  }, [books, shelves]);

  if (!isMounted) {
    return null;
  }

  return (
    <div style={page}>
      <div style={header}>
        <Link href="/library" style={backLink}>
          ← {t({ nl: "Terug", en: "Back" }, lang)}
        </Link>
        <h1 style={title}>{t({ nl: "Statistieken", en: "Statistics" }, lang)}</h1>
      </div>

      <div style={content}>
        {/* Total Books */}
        <div style={card}>
          <div style={cardLabel}>{t({ nl: "Totaal boeken", en: "Total books" }, lang)}</div>
          <div style={cardValue}>{stats.total}</div>
        </div>

        {/* Status Distribution */}
        <div style={card}>
          <div style={cardLabel}>{t({ nl: "Statusverdeling", en: "Status distribution" }, lang)}</div>
          <div style={statusGrid}>
            {(["TBR", "Reading", "Finished"] as BookStatus[]).map((status) => {
              const count = stats.statusCounts[status];
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={status} style={statusItem}>
                  <div style={statusHeader}>
                    <span style={{
                      ...statusBadge,
                      background: statusColor(status, isCalm),
                    }}>
                      {statusLabel(status, lang)}
                    </span>
                    <span style={statusCount}>{count}</span>
                  </div>
                  <div style={getStatusBarContainer(isCalm)}>
                    <div
                      style={{
                        ...statusBar,
                        width: `${percentage}%`,
                        background: statusColor(status, isCalm),
                      }}
                    />
                  </div>
                  <div style={statusPercentage}>{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formats */}
        <div style={card}>
          <div style={cardLabel}>{t({ nl: "Formaten", en: "Formats" }, lang)}</div>
            <div style={formatGrid}>
            <div style={getFormatItem(isCalm)}>
              <div style={formatEmoji}>📖</div>
              <div style={formatInfo}>
                <div style={formatLabel}>{t({ nl: "Fysiek", en: "Physical" }, lang)}</div>
                <div style={formatCount}>{stats.formatCounts.physical}</div>
              </div>
            </div>
            <div style={getFormatItem(isCalm)}>
              <div style={formatEmoji}>📱</div>
              <div style={formatInfo}>
                <div style={formatLabel}>{t({ nl: "E-book", en: "E-book" }, lang)}</div>
                <div style={formatCount}>{stats.formatCounts.ebook}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Shelves */}
        {stats.shelfCounts.length > 0 && (
          <div style={card}>
            <div style={cardLabel}>{t({ nl: "Shelves", en: "Shelves" }, lang)}</div>
            <div style={shelfList}>
              {stats.shelfCounts.map(({ shelf, count }) => {
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={shelf.id} style={shelfItem}>
                    <div style={shelfHeader}>
                      <span style={shelfEmoji}>{shelf.emoji}</span>
                      <span style={shelfName}>{shelf.name}</span>
                      <span style={shelfCount}>{count}</span>
                    </div>
                    <div style={getStatusBarContainer(isCalm)}>
                      <div
                        style={{
                          ...statusBar,
                          width: `${percentage}%`,
                          background: isCalm 
                            ? "rgba(156, 107, 47, 0.15)" 
                            : "rgba(109,94,252,0.15)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
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

const statusGrid: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const statusItem: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const statusHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const statusBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text)",
};

const statusCount: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "var(--text)",
};

const getStatusBarContainer = (isCalm: boolean): React.CSSProperties => ({
  width: "100%",
  height: 6,
  borderRadius: 999,
  background: isCalm 
    ? "rgba(58, 42, 26, 0.08)" 
    : "rgba(255,255,255,0.08)",
  overflow: "hidden",
});

const statusBar: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  transition: "width 0.3s ease",
};

const statusPercentage: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--muted2)",
  textAlign: "right",
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

const formatCount: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 950,
  color: "var(--text)",
  lineHeight: 1,
};

const shelfList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const shelfItem: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const shelfHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const shelfEmoji: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1,
};

const shelfName: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--text)",
  flex: 1,
};

const shelfCount: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  color: "var(--text)",
};

