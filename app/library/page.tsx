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
      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <button
          style={btnSecondary}
          onClick={refreshCovers}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing…" : "Refresh covers"}
        </button>
        <button
          style={btnSecondary}
          onClick={() => {
            // Debug: test Open Library cover voor eerste boek
            if (books.length > 0) {
              const firstBook = books[0];
              const testUrl = `https://covers.openlibrary.org/b/isbn/${firstBook.isbn13.replace(/[^\dX]/gi, "")}-M.jpg`;
              console.log("Testing cover URL:", testUrl);
              console.log("ISBN:", firstBook.isbn13);
              window.open(testUrl, "_blank");
            }
          }}
        >
          Test cover (first book)
        </button>
      </div>

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

/** Cover component: laad altijd direct van Open Library op basis van ISBN
 * - Open Library Covers API: https://covers.openlibrary.org/b/isbn/{ISBN}-{SIZE}.jpg
 * - Formaten: -S (small), -M (medium), -L (large)
 * - Rate limit: 100 requests/IP per 5 minuten (voor ISBN lookups)
 * - Geen API key nodig, gratis, geen CORS problemen
 */
function Cover({ isbn13, coverUrl, title }: { isbn13: string; coverUrl: string; title: string }) {
  // Normaliseer ISBN: verwijder alle niet-numerieke tekens (behalve X voor ISBN-10)
  const normalizedIsbn = (isbn13 || "").replace(/[^\dX]/gi, "");
  
  // Open Library Covers API - direct laden op basis van ISBN
  // URL pattern: https://covers.openlibrary.org/b/$key/$value-$size.jpg
  // We gebruiken ISBN als key, met formaten S, M, L
  const openLibrarySmall = `https://covers.openlibrary.org/b/isbn/${normalizedIsbn}-S.jpg`;
  const openLibraryMedium = `https://covers.openlibrary.org/b/isbn/${normalizedIsbn}-M.jpg`;
  const openLibraryLarge = `https://covers.openlibrary.org/b/isbn/${normalizedIsbn}-L.jpg`;
  
  // Start altijd met Open Library Medium (beste balans kwaliteit/snelheid)
  const [currentSrc, setCurrentSrc] = useState<string>(openLibraryMedium);
  const [hasValidCover, setHasValidCover] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState(0);
  
  // Check of cover bestaat voordat we het proberen te laden
  useEffect(() => {
    if (!normalizedIsbn) {
      setHasValidCover(false);
      return;
    }

    // Reset state
    setCurrentSrc(openLibraryMedium);
    setErrorCount(0);
    setHasValidCover(false);

    // Check of de cover bestaat door de eerste bytes te lezen
    // Open Library retourneert een 1x1 GIF als er geen cover is
    const checkCover = async () => {
      try {
        const response = await fetch(openLibraryMedium, { method: "HEAD" });
        if (!response.ok) {
          // Probeer Large
          const responseLarge = await fetch(openLibraryLarge, { method: "HEAD" });
          if (responseLarge.ok) {
            setCurrentSrc(openLibraryLarge);
            setHasValidCover(true);
            return;
          }
          // Probeer Small
          const responseSmall = await fetch(openLibrarySmall, { method: "HEAD" });
          if (responseSmall.ok) {
            setCurrentSrc(openLibrarySmall);
            setHasValidCover(true);
            return;
          }
          setHasValidCover(false);
          return;
        }
        
        // Check content-type en content-length
        const contentType = response.headers.get("content-type");
        const contentLength = response.headers.get("content-length");
        
        // Als het een GIF is en klein (< 100 bytes), is het waarschijnlijk een placeholder
        if (contentType?.includes("gif") && contentLength && parseInt(contentLength) < 100) {
          // Probeer andere formaten
          const responseLarge = await fetch(openLibraryLarge, { method: "HEAD" });
          if (responseLarge.ok && !responseLarge.headers.get("content-type")?.includes("gif")) {
            setCurrentSrc(openLibraryLarge);
            setHasValidCover(true);
            return;
          }
          setHasValidCover(false);
          return;
        }
        
        setHasValidCover(true);
      } catch (error) {
        setHasValidCover(false);
      }
    };

    checkCover();
  }, [normalizedIsbn, openLibraryMedium, openLibraryLarge, openLibrarySmall]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    
    // Double check: als de afbeelding 1x1 is, is het een placeholder
    if (img.naturalWidth <= 1 && img.naturalHeight <= 1) {
      setHasValidCover(false);
      img.style.display = "none";
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const newErrorCount = errorCount + 1;
    setErrorCount(newErrorCount);
    
    // Debug: log errors (alleen in development)
    if (process.env.NODE_ENV === "development") {
      console.warn(`Cover load error ${newErrorCount} for ISBN ${normalizedIsbn}:`, currentSrc);
    }
    
    // Fallback chain: probeer verschillende Open Library formaten
    // 1. Eerste error: probeer Large (mogelijk beschikbaar waar Medium niet werkt)
    if (newErrorCount === 1) {
      setCurrentSrc(openLibraryLarge);
      setHasValidCover(true);
      return;
    }
    // 2. Tweede error: probeer Small
    if (newErrorCount === 2) {
      setCurrentSrc(openLibrarySmall);
      setHasValidCover(true);
      return;
    }
    // 3. Derde error: verberg image (placeholder blijft zichtbaar)
    // Open Library retourneert een blank image als cover niet gevonden wordt
    if (newErrorCount >= 3) {
      setHasValidCover(false);
      img.style.display = "none";
    }
  };

  if (!normalizedIsbn) {
    return (
      <div style={coverWrap}>
        <div style={coverPlaceholder}>
          <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.1 }}>📚</div>
          <div style={{ fontSize: 12, color: "#b7b7b7" }}>No ISBN</div>
        </div>
      </div>
    );
  }

  // Als we weten dat er geen cover is, toon alleen placeholder
  if (!hasValidCover && errorCount >= 2) {
    return (
      <div style={coverWrap}>
        <div style={coverPlaceholder}>
          <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.1 }}>📚</div>
          <div style={{ fontSize: 12, color: "#b7b7b7" }}>No cover</div>
        </div>
      </div>
    );
  }

  return (
    <div style={coverWrap}>
      {hasValidCover && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={coverImg}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
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

