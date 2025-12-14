"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadBooks, saveBooks, type Book } from "@/lib/storage";
import { lookupByIsbn } from "@/lib/lookup";

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshCovers() {
    setRefreshing(true);
    try {
      const current = loadBooks();
  
      const updated = await Promise.all(
        current.map(async (b) => {
          const data = await lookupByIsbn(b.isbn13);
  
          // Alleen aanvullen/verbeteren (niet kapotmaken)
          return {
            ...b,
            title: b.title && b.title !== "(Unknown title)" ? b.title : (data.title || b.title),
            authors: b.authors?.length ? b.authors : (data.authors || b.authors || []),
            coverUrl: data.coverUrl || b.coverUrl || "",
            updatedAt: Date.now(),
          };
        })
      );
  
      saveBooks(updated);
      setBooks(updated);
    } finally {
      setRefreshing(false);
    }
  }
  
  useEffect(() => setBooks(loadBooks()), []);

  return (
    <main style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <div style={topbar}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>My Shelf</h1>
          <p style={{ margin: "6px 0 0", color: "#b7b7b7" }}>
            {books.length} book{books.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/scan">
          <button style={btnPrimary}>+ Scan</button>
        </Link>
      </div>
      <button
  style={btnSecondary}
  onClick={refreshCovers}
  disabled={refreshing}
>
  {refreshing ? "Refreshing…" : "Refresh covers"}
</button>

      {books.length === 0 ? (
        <div style={emptyCard}>
          <p style={{ color: "#b7b7b7", marginTop: 0 }}>
            No books yet. Scan your first one.
          </p>
          <Link href="/scan">
            <button style={btnPrimary}>Scan a book</button>
          </Link>
        </div>
      ) : (
        <div style={grid}>
          {books.map((b) => (
            <div key={b.id} style={bookCard}>
              <Cover isbn13={b.isbn13} coverUrl={b.coverUrl || ""} title={b.title} />

              <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                <div style={titleStyle}>{b.title}</div>

                {b.authors?.length > 0 && (
                  <div style={authorStyle}>by {b.authors.join(", ")}</div>
                )}

                <div style={metaRow}>
                  <span style={badge}>{b.status || "TBR"}</span>
                  <span style={isbnStyle}>ISBN {b.isbn13}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}function toHttps(url: string) {
  if (!url) return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

/** Cover component met robuuste fallback voor mobiel:
 * - Start altijd met Open Library (beste mobiel compatibiliteit)
 * - Probeert opgeslagen coverUrl als fallback
 * - Meerdere Open Library formaten als backup
 */
function Cover({ isbn13, coverUrl, title }: { isbn13: string; coverUrl: string; title: string }) {
  // Open Library heeft beste mobiel compatibiliteit, gebruik dit als primaire source
  const openLibraryMedium = `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg`;
  const openLibraryLarge = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`;
  
  // Bepaal initiële source: probeer eerst opgeslagen URL, dan Open Library
  const getInitialSrc = () => {
    if (coverUrl) {
      const httpsUrl = toHttps(coverUrl);
      // Google Books thumbnails werken vaak goed, probeer die eerst
      if (httpsUrl.includes("books.google.com") || httpsUrl.includes("googleusercontent.com")) {
        // Gebruik Google Books URL maar met betere parameters
        return httpsUrl.replace(/zoom=\d+/, "zoom=2").replace(/&edge=curl/, "");
      }
      // Andere URLs direct gebruiken
      return httpsUrl;
    }
    // Geen coverUrl: start met Open Library
    return openLibraryMedium;
  };
  
  const [currentSrc, setCurrentSrc] = useState<string>(getInitialSrc);
  const [errorCount, setErrorCount] = useState(0);
  
  // Update source wanneer coverUrl of isbn13 verandert
  useEffect(() => {
    const newSrc = getInitialSrc();
    setCurrentSrc(newSrc);
    setErrorCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverUrl, isbn13]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const newErrorCount = errorCount + 1;
    setErrorCount(newErrorCount);
    
    // Intelligente fallback chain:
    // 1. Eerste error: probeer Open Library Medium
    if (newErrorCount === 1) {
      setCurrentSrc(openLibraryMedium);
      return;
    }
    // 2. Tweede error: probeer Open Library Large
    if (newErrorCount === 2) {
      setCurrentSrc(openLibraryLarge);
      return;
    }
    // 3. Derde error: probeer opgeslagen URL opnieuw (als die anders was)
    if (newErrorCount === 3 && coverUrl) {
      const httpsUrl = toHttps(coverUrl);
      if (httpsUrl !== currentSrc && httpsUrl !== openLibraryMedium && httpsUrl !== openLibraryLarge) {
        setCurrentSrc(httpsUrl);
        return;
      }
    }
    // 4. Vierde error: verberg image (placeholder blijft zichtbaar)
    if (newErrorCount >= 4) {
      img.style.display = "none";
    }
  };

  return (
    <div style={coverWrap}>
      <img
        key={currentSrc}
        src={currentSrc}
        alt={title}
        loading="lazy"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        style={coverImg}
        onError={handleError}
      />
      <div style={coverPlaceholder}>
        <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.1 }}>📚</div>
        <div style={{ fontSize: 12, color: "#b7b7b7" }}>No cover</div>
      </div>
    </div>
  );
}
const topbar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const grid: React.CSSProperties = {
  display: "grid",
  gap: 14,
  marginTop: 14,
  gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
};

const bookCard: React.CSSProperties = {
  background: "#18181c",
  border: "1px solid #2a2a32",
  borderRadius: 18,
  padding: 12,
  boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
};

const coverWrap: React.CSSProperties = {
  position: "relative",
  width: "100%",
  borderRadius: 16,
  overflow: "hidden",
  border: "1px solid #2a2a32",
  background: "#101014",
  aspectRatio: "2 / 3", // 📕 nice book ratio
};

const coverImg: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const coverPlaceholder: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  background:
    "linear-gradient(135deg, rgba(109,94,252,0.25), rgba(0,0,0,0) 55%), #101014",
};

const titleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  lineHeight: 1.2,
};

const authorStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#cfcfe6",
  fontWeight: 650,
};

const metaRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  marginTop: 2,
};

const badge: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#242432",
  color: "#fff",
};

const isbnStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#8f8fa3",
};

const emptyCard: React.CSSProperties = {
  background: "#18181c",
  border: "1px solid #2a2a32",
  borderRadius: 18,
  padding: 14,
  marginTop: 14,
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: 0,
  background: "#6d5efc",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: 0,
  background: "#2a2a32",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

