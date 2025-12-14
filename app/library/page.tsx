"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { loadBooks, saveBooks, getActiveShelfId, setActiveShelfId, ensureDefaultShelf, loadShelves, createShelf, updateBook, deleteBook, type Book, type Shelf, type BookStatus } from "@/lib/storage";
import { lookupByIsbn } from "@/lib/lookup";

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeShelfId, setActiveShelfIdState] = useState<string | null>(null);
  const [showNewShelfModal, setShowNewShelfModal] = useState(false);
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfEmoji, setNewShelfEmoji] = useState("📚");
  const [actionMenuBookId, setActionMenuBookId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    // Ensure default shelf exists
    ensureDefaultShelf();
    
    // Load shelves
    const allShelves = loadShelves();
    setShelves(allShelves);
    
    // Get active shelf ID
    const activeId = getActiveShelfId();
    setActiveShelfIdState(activeId);
    
    // Load books and migrate any without shelfId to default shelf
    const allBooks = loadBooks();
    const defaultShelfId = getActiveShelfId() || ensureDefaultShelf().id;
    
    const needsMigration = allBooks.some((b) => !b.shelfId);
    if (needsMigration) {
      const migrated = allBooks.map((b) => ({
        ...b,
        shelfId: b.shelfId || defaultShelfId,
        updatedAt: b.updatedAt || Date.now(),
      }));
      saveBooks(migrated);
      setBooks(migrated);
    } else {
      setBooks(allBooks);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowShelfDropdown(false);
      }
      // Close action menus
      const target = event.target as Node;
      const isInsideActionMenu = Object.values(actionMenuRefs.current).some(
        (ref) => ref && ref.contains(target)
      );
      if (!isInsideActionMenu) {
        setActionMenuBookId(null);
      }
    }
    if (showShelfDropdown || actionMenuBookId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showShelfDropdown, actionMenuBookId]);

  // Filter books by active shelf
  const activeBooks = useMemo(() => {
    if (!activeShelfId) return [];
    return books.filter((b) => b.shelfId === activeShelfId);
  }, [books, activeShelfId]);

  const stats = useMemo(() => {
    const tbr = activeBooks.filter((b) => (b.status ?? "TBR") === "TBR").length;
    const reading = activeBooks.filter((b) => (b.status ?? "TBR") === "Reading").length;
    const read = activeBooks.filter((b) => (b.status ?? "TBR") === "Finished").length;
   
    return { total: activeBooks.length, tbr, reading, read };
  }, [activeBooks]);
  

  function handleShelfSelect(shelfId: string) {
    setActiveShelfId(shelfId);
    setActiveShelfIdState(shelfId);
    setShowShelfDropdown(false);
  }

  function handleCreateShelf() {
    if (!newShelfName.trim() || newShelfName.trim().length > 24) return;
    
    const shelf = createShelf(newShelfName.trim(), newShelfEmoji);
    const updatedShelves = loadShelves();
    setShelves(updatedShelves);
    setActiveShelfIdState(shelf.id);
    setShowNewShelfModal(false);
    setNewShelfName("");
    setNewShelfEmoji("📚");
  }

  function handleMoveBook(bookId: string, targetShelfId: string) {
    updateBook(bookId, { shelfId: targetShelfId });
    const updated = loadBooks();
    setBooks(updated);
    setActionMenuBookId(null);
  }

  function handleChangeStatus(bookId: string, status: BookStatus) {
    updateBook(bookId, { status });
    const updated = loadBooks();
    setBooks(updated);
    setActionMenuBookId(null);
  }

  function handleDeleteBook(bookId: string) {
    deleteBook(bookId);
    const updated = loadBooks();
    setBooks(updated);
    setActionMenuBookId(null);
    setShowDeleteConfirm(null);
  }

  async function refreshCovers() {
    setRefreshing(true);
    try {
      const current = loadBooks();
      const updated = await Promise.all(
        current.map(async (b) => {
          const data = await lookupByIsbn(b.isbn13);
          return {
            ...b,
            title: b.title && b.title !== "Unknown title" ? b.title : (data.title || b.title),
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

  const activeShelf = shelves.find((s) => s.id === activeShelfId);
  
  // Get first few covers for blurred background
  const shelfCovers = useMemo(() => {
    return activeBooks
      .filter((b) => b.coverUrl || b.isbn13)
      .slice(0, 3)
      .map((b) => b.coverUrl || `https://covers.openlibrary.org/b/isbn/${b.isbn13}-L.jpg?default=false`);
  }, [activeBooks]);

  return (
    <main style={page}>
      {/* Shelf Header with blurred background */}
      <div style={shelfHeader}>
        {shelfCovers.length > 0 && (
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${shelfCovers[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(40px) brightness(0.4)",
            transform: "scale(1.1)",
            zIndex: 0,
          }} />
        )}
        <div style={{
          position: "absolute",
          inset: 0,
          background: shelfCovers.length > 0
            ? "linear-gradient(135deg, rgba(109,94,252,0.35), rgba(255,73,240,0.20) 45%, rgba(0,0,0,0.7) 70%)"
            : "linear-gradient(135deg, rgba(109,94,252,0.22), rgba(255,73,240,0.10) 45%, rgba(0,0,0,0) 70%), #121218",
          zIndex: 0,
        }} />
        <div style={{ ...shelfHeaderContent, position: "relative", zIndex: 1 }}>
          <div style={{ position: "relative", display: "inline-block" }} ref={dropdownRef}>
            <button
              style={shelfSelector}
              onClick={() => setShowShelfDropdown(!showShelfDropdown)}
            >
              <span style={{ fontSize: 24 }}>{activeShelf?.emoji || "📚"}</span>
              <span style={{ fontSize: 20, fontWeight: 950 }}>{activeShelf?.name || "My Shelf"}</span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>▼</span>
            </button>
            
            {showShelfDropdown && (
              <div style={dropdown}>
                {shelves.map((shelf) => (
                  <button
                    key={shelf.id}
                    style={{
                      ...dropdownItem,
                      ...(shelf.id === activeShelfId ? dropdownItemActive : {}),
                    }}
                    onClick={() => handleShelfSelect(shelf.id)}
                  >
                    <span>{shelf.emoji}</span>
                    <span>{shelf.name}</span>
                    {shelf.id === activeShelfId && <span style={{ fontSize: 10 }}>✓</span>}
                  </button>
                ))}
                <div style={dropdownDivider} />
                <button
                  style={dropdownItem}
                  onClick={() => {
                    setShowShelfDropdown(false);
                    setShowNewShelfModal(true);
                  }}
                >
                  <span>+</span>
                  <span>New shelf</span>
                </button>
              </div>
            )}
          </div>
          
          <div style={shelfStats}>
            <div style={statItem}>
              <span style={statNumber}>{stats.total}</span>
              <span style={statLabel}>Total</span>
            </div>
            <div style={statItem}>
              <span style={statNumber}>{stats.tbr}</span>
              <span style={statLabel}>TBR</span>
            </div>
            <div style={statItem}>
              <span style={statNumber}>{stats.reading}</span>
              <span style={statLabel}>Reading</span>
            </div>
            <div style={statItem}>
              <span style={statNumber}>{stats.read}</span>
              <span style={statLabel}>Finished</span>
            </div>
          </div>
        </div>

        <div style={{ ...actions, position: "relative", zIndex: 1 }}>
          <button style={btnGhost} onClick={refreshCovers} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh covers"}
          </button>
          <Link href="/scan">
            <button style={btnPrimary}>+ Scan</button>
          </Link>
        </div>
      </div>

      {showNewShelfModal && (
        <div style={modalOverlay} onClick={() => setShowNewShelfModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>New Shelf</h2>
            <div style={modalForm}>
              <div style={formGroup}>
                <label style={formLabel}>Name</label>
                <input
                  type="text"
                  value={newShelfName}
                  onChange={(e) => setNewShelfName(e.target.value.slice(0, 24))}
                  placeholder="My Shelf"
                  maxLength={24}
                  style={formInput}
                  autoFocus
                />
                <div style={formHint}>{newShelfName.length}/24</div>
              </div>
              <div style={formGroup}>
                <label style={formLabel}>Emoji (optional)</label>
                <input
                  type="text"
                  value={newShelfEmoji}
                  onChange={(e) => setNewShelfEmoji(e.target.value || "📚")}
                  placeholder="📚"
                  style={formInput}
                />
              </div>
              <div style={modalActions}>
                <button style={btnGhost} onClick={() => setShowNewShelfModal(false)}>
                  Cancel
                </button>
                <button
                  style={btnPrimary}
                  onClick={handleCreateShelf}
                  disabled={!newShelfName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={modalOverlay} onClick={() => setShowDeleteConfirm(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>Delete book?</h2>
            <p style={{ color: "#cfcfe6", margin: "0 0 24px" }}>
              This action cannot be undone.
            </p>
            <div style={modalActions}>
              <button style={btnGhost} onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                style={{ ...btnPrimary, background: "linear-gradient(135deg, #ff6b6b, #ee5a6f)" }}
                onClick={() => handleDeleteBook(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {activeBooks.length === 0 ? (
        <div style={emptyCard}>
          <p style={{ color: "#cfcfe6", marginTop: 0, fontWeight: 700 }}>
            No books yet. Time to scan 📚✨
          </p>
          <Link href="/scan">
            <button style={btnPrimary}>Scan your first book</button>
          </Link>
        </div>
      ) : (
        <div style={grid}>
          {activeBooks.map((b, idx) => (
            <div key={b.id} style={{ ...card, animationDelay: `${idx * 35}ms`, position: "relative" }}>
              <button
                style={actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setActionMenuBookId(actionMenuBookId === b.id ? null : b.id);
                }}
              >
                ⋯
              </button>
              
              {actionMenuBookId === b.id && (
                <div
                  ref={(el) => {
                    actionMenuRefs.current[b.id] = el;
                  }}
                  style={actionMenu}
                >
                  <div style={actionMenuSection}>
                    <div style={actionMenuLabel}>Move to shelf</div>
                    {shelves.map((shelf) => (
                      <button
                        key={shelf.id}
                        style={{
                          ...actionMenuItem,
                          ...(shelf.id === b.shelfId ? actionMenuItemActive : {}),
                        }}
                        onClick={() => handleMoveBook(b.id, shelf.id)}
                      >
                        <span>{shelf.emoji}</span>
                        <span>{shelf.name}</span>
                        {shelf.id === b.shelfId && <span style={{ fontSize: 10 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                  
                  <div style={actionMenuDivider} />
                  
                  <div style={actionMenuSection}>
                    <div style={actionMenuLabel}>Change status</div>
                    {(["TBR", "Reading", "Finished"] as BookStatus[]).map((status) => (
                      <button
                        key={status}
                        style={{
                          ...actionMenuItem,
                          ...(b.status === status ? actionMenuItemActive : {}),
                        }}
                        onClick={() => handleChangeStatus(b.id, status)}
                      >
                        <span>{status}</span>
                        {b.status === status && <span style={{ fontSize: 10 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                  
                  <div style={actionMenuDivider} />
                  
                  <button
                    style={{ ...actionMenuItem, color: "#ff6b6b" }}
                    onClick={() => setShowDeleteConfirm(b.id)}
                  >
                    <span>Delete book</span>
                  </button>
                </div>
              )}

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
        <div style={{ fontWeight: 950, fontSize: 16, lineHeight: 1.2 }}>{title || "Unknown"}</div>
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

const shelfHeader: React.CSSProperties = {
  position: "relative",
  padding: 20,
  borderRadius: 22,
  border: "1px solid #2a2a32",
  boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
  marginBottom: 16,
  overflow: "hidden",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 14,
  flexWrap: "wrap",
};

const shelfHeaderContent: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  flex: 1,
};

const shelfStats: React.CSSProperties = {
  display: "flex",
  gap: 20,
  flexWrap: "wrap",
};

const statItem: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const statNumber: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 950,
  color: "#fff",
  lineHeight: 1,
};

const statLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#cfcfe6",
  opacity: 0.8,
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

const shelfSelector: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 16,
  border: "1px solid #2a2a32",
  background: "#15151c",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
  fontSize: 18,
  marginBottom: 8,
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: 8,
  minWidth: 200,
  background: "#15151c",
  border: "1px solid #2a2a32",
  borderRadius: 16,
  padding: 8,
  zIndex: 1000,
  boxShadow: "0 16px 50px rgba(0,0,0,0.65)",
};

const dropdownItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: 0,
  background: "transparent",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 15,
  textAlign: "left",
};

const dropdownItemActive: React.CSSProperties = {
  background: "rgba(109,94,252,0.18)",
  color: "#d8d8ff",
};

const dropdownDivider: React.CSSProperties = {
  height: 1,
  background: "#2a2a32",
  margin: "6px 0",
};

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: 16,
};

const modal: React.CSSProperties = {
  background: "#15151c",
  border: "1px solid #2a2a32",
  borderRadius: 22,
  padding: 24,
  maxWidth: 400,
  width: "100%",
  boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
};

const modalTitle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: 24,
  fontWeight: 950,
  color: "#fff",
};

const modalForm: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const formGroup: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const formLabel: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#cfcfe6",
};

const formInput: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid #2a2a32",
  background: "#101014",
  color: "#fff",
  fontSize: 16,
  fontFamily: "inherit",
};

const formHint: React.CSSProperties = {
  fontSize: 12,
  color: "#8f8fa3",
  textAlign: "right",
};

const modalActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  marginTop: 8,
};

const actionButton: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid #2a2a32",
  background: "rgba(21, 21, 28, 0.9)",
  color: "#fff",
  fontSize: 18,
  fontWeight: 900,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
  backdropFilter: "blur(8px)",
};

const actionMenu: React.CSSProperties = {
  position: "absolute",
  top: 40,
  right: 8,
  minWidth: 200,
  background: "#15151c",
  border: "1px solid #2a2a32",
  borderRadius: 16,
  padding: 8,
  zIndex: 1000,
  boxShadow: "0 16px 50px rgba(0,0,0,0.65)",
};

const actionMenuSection: React.CSSProperties = {
  display: "grid",
  gap: 4,
};

const actionMenuLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  color: "#8f8fa3",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  padding: "8px 12px 4px",
};

const actionMenuItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: 0,
  background: "transparent",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
  textAlign: "left",
};

const actionMenuItemActive: React.CSSProperties = {
  background: "rgba(109,94,252,0.18)",
  color: "#d8d8ff",
};

const actionMenuDivider: React.CSSProperties = {
  height: 1,
  background: "#2a2a32",
  margin: "6px 0",
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
