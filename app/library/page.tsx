"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadBooks, saveBooks, type Book } from "@/lib/storage";
import { lookupByIsbn } from "@/lib/lookup";

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => setBooks(loadBooks()), []);

  const stats = useMemo(() => {
    const tbr = books.filter((b) => (b.status ?? "TBR") === "TBR").length;
    const reading = books.filter((b) => (b.status ?? "TBR") === "Reading").length;
    const read = books.filter((b) => (b.status ?? "TBR") === "Finished").length;
   
    return { total: books.length, tbr, reading, read };
  }, [books]);
  

  async function refreshCovers() {
    setRefreshing(true);
    try {
      const current = loadBooks();
      const updated = await Promise.all(
        current.map(async (b) => {
          const data = await lookupByIsbn(b.isbn13);
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

  return (
    <main style={page}>
      <div style={hero}>
        <div>
          <div style={kicker}>ShelfieEase • BookTok</div>
          <h1 style={h1}>My Shelf</h1>
          <p style={sub}>
            {stats.total} boek{stats.total === 1 ? "" : "en"} • {stats.tbr} TBR • {stats.reading} Reading •{" "}
            {stats.read} Read
          </p>
        </div>

        <div style={actions}>
          <button style={btnGhost} onClick={refreshCovers} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh covers"}
          </button>
          <Link href="/scan">
            <button style={btnPrimary}>+ Scan</button>
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <div style={emptyCard}>
          <p style={{ color: "#cfcfe6", marginTop: 0, fontWeight: 700 }}>
            Nog geen boeken. Tijd om te scannen 📚✨
          </p>
          <Link href="/scan">
            <button style={btnPrimary}>Scan je eerste boek</button>
          </Link>
        </div>
      ) : (
        <div style={grid}>
          {books.map((b, idx) => (
            <div key={b.id} style={{ ...card, animationDelay: `${idx * 35}ms` }}>
              <Cover isbn13={b.isbn13} coverUrl={b.coverUrl || ""} title={b.title} authors={b.authors || []} />

              <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                <div style={title}>{b.title}</div>
                {b.authors?.length ? <div style={author}>by {b.authors.join(", ")}</div> : null}

                <div style={metaRow}>
                  <span style={badgeFor(b.status || "TBR")}>{(b.status || "TBR")}</span>
                  <span style={isbn}>ISBN {b.isbn13}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CSS voor animaties + glow */}
      <style>{css}</style>
    </main>
  );
}

function toHttps(url: string) {
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function Cover({
  isbn13,
  coverUrl,
  title,
  authors,
}: {
  isbn13: string;
  coverUrl: string;
  title: string;
  authors: string[];
}) {
  const ol = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg?default=false`;
  const candidates = [coverUrl ? toHttps(coverUrl) : "", ol].filter(Boolean);

  const [srcIndex, setSrcIndex] = useState(0);
  const src = candidates[srcIndex] || "";

  const goNext = () => setSrcIndex((i) => (i + 1 < candidates.length ? i + 1 : i));

  return (
    <div style={coverWrap}>
      {src ? (
        <img
          src={src}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={coverImg}
          onError={() => {
            if (srcIndex + 1 < candidates.length) goNext();
          }}
          onLoad={(e) => {
            // Filter "Image not available" (vaak heel klein)
            const img = e.currentTarget;
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              if (img.naturalWidth < 90 || img.naturalHeight < 120) {
                if (srcIndex + 1 < candidates.length) goNext();
              }
            }
          }}
        />
      ) : null}

      <div style={coverPlaceholder}>
        <div style={{ fontWeight: 950, fontSize: 16, lineHeight: 1.2 }}>{title || "Unknown title"}</div>
        {authors.length ? <div style={{ marginTop: 6, fontSize: 12, color: "#d8d8ff" }}>{authors.join(", ")}</div> : null}
        <div style={{ marginTop: 10, fontSize: 12, color: "#b7b7b7" }}>ISBN {isbn13}</div>
      </div>
    </div>
  );
}

/* ------- styles ------- */

const page: React.CSSProperties = {
  padding: 16,
  maxWidth: 1060,
  margin: "0 auto",
};

const hero: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 14,
  flexWrap: "wrap",
  padding: 14,
  borderRadius: 22,
  border: "1px solid #2a2a32",
  background:
    "linear-gradient(135deg, rgba(109,94,252,0.22), rgba(255,73,240,0.10) 45%, rgba(0,0,0,0) 70%), #121218",
  boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
};

const kicker: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.6,
  color: "#cfcfe6",
  opacity: 0.9,
};

const h1: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 30,
  fontWeight: 950,
};

const sub: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#cfcfe6",
  opacity: 0.9,
  fontWeight: 650,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 16,
  border: 0,
  background: "linear-gradient(135deg, #6d5efc, #ff49f0)",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(109,94,252,0.35)",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 16,
  border: "1px solid #2a2a32",
  background: "#15151c",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const emptyCard: React.CSSProperties = {
  marginTop: 14,
  padding: 16,
  borderRadius: 18,
  border: "1px solid #2a2a32",
  background: "#15151c",
};

const grid: React.CSSProperties = {
  display: "grid",
  gap: 14,
  marginTop: 14,
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
};

const card: React.CSSProperties = {
  background: "#14141a",
  border: "1px solid #2a2a32",
  borderRadius: 22,
  padding: 12,
  boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
  animation: "popIn 420ms ease both",
};

const coverWrap: React.CSSProperties = {
  position: "relative",
  width: "100%",
  borderRadius: 18,
  overflow: "hidden",
  border: "1px solid #2a2a32",
  background: "#101014",
  aspectRatio: "2 / 3",
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
  alignContent: "center",
  gap: 2,
  padding: 12,
  textAlign: "left",
  background:
    "linear-gradient(135deg, rgba(109,94,252,0.22), rgba(255,73,240,0.10) 45%, rgba(0,0,0,0) 70%), #101014",
};

const title: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 950,
  lineHeight: 1.2,
};

const author: React.CSSProperties = {
  fontSize: 13,
  color: "#d8d8ff",
  fontWeight: 700,
};

const metaRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  marginTop: 2,
};

const isbn: React.CSSProperties = {
  fontSize: 12,
  color: "#8f8fa3",
};

function badgeFor(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 950,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #2a2a32",
  };

  if (status === "Finished") return { ...base, background: "rgba(79, 209, 197, 0.18)", color: "#bff7ef" };
  if (status === "Reading") return { ...base, background: "rgba(255, 203, 76, 0.16)", color: "#ffe2a3" };
  return { ...base, background: "rgba(109,94,252,0.18)", color: "#d8d8ff" };
}

const css = `
@keyframes popIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (hover:hover) {
  div[style*="animation: popIn"] {
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }
  div[style*="animation: popIn"]:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 46px rgba(0,0,0,0.55);
    border-color: rgba(255,73,240,0.35);
  }
}

button:active {
  transform: translateY(1px) scale(0.99);
}
`;
