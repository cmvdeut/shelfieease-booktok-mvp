"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  loadBooks,
  saveBooks,
  getActiveShelfId,
  setActiveShelfId,
  ensureDefaultShelf,
  ensureDefaultShelves,
  loadShelves,
  createShelf,
  updateBook,
  deleteBook,
  upsertBook,
  findShelfByName,
  type Book,
  type Shelf,
  type BookStatus,
  type BookFormat,
  type Mood,
} from "@/lib/storage";

import { getMood } from "@/components/MoodProvider";

import { lookupByIsbn } from "@/lib/lookup";
import { CoverImg } from "@/components/CoverImg";
import { toBlob } from "html-to-image";


export default function LibraryPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeShelfId, setActiveShelfIdState] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingIsbn, setPendingIsbn] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<{ title?: string; authors?: string[]; coverUrl?: string } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [targetShelfId, setTargetShelfId] = useState<string | null>(null);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfEmoji, setNewShelfEmoji] = useState("📚");
  const [showNewShelfInAddModal, setShowNewShelfInAddModal] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }, []);

  const handleBookAdded = useCallback(() => {
    console.log("onAdded callback called, reloading books");
    // Force reload from localStorage
    const updatedBooks = loadBooks();
    console.log("Loaded books:", updatedBooks.length, updatedBooks);
    setBooks([...updatedBooks]); // Spread om nieuwe array referentie te forceren
  }, []);
  const [showNewShelfModal, setShowNewShelfModal] = useState(false);
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [emojiTouched, setEmojiTouched] = useState(false);
  const [suggestedEmoji, setSuggestedEmoji] = useState<string | null>(null);
  const [newShelfMood, setNewShelfMood] = useState<Mood>("aesthetic");
  const [actionMenuBookId, setActionMenuBookId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<{ bookId: string; coverUrl: string; title: string } | null>(null);
  const [coverPreviewLoading, setCoverPreviewLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareCoverUrls, setShareCoverUrls] = useState<string[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [shareFilename, setShareFilename] = useState("");
  const [shareCaption, setShareCaption] = useState("");
  const [copyImageStatus, setCopyImageStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [copyCaptionStatus, setCopyCaptionStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [scope, setScope] = useState<"shelf" | "all">("shelf");
  const [statusFilter, setStatusFilter] = useState<Set<BookStatus>>(new Set(["TBR", "Reading", "Finished"]));
  const [sortBy, setSortBy] = useState<"recent" | "title" | "author">("recent");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const shareCardRef = useRef<HTMLDivElement>(null);
  const handledIsbnRef = useRef<string | null>(null);

  // Handle addIsbn query parameter - open modal instead of auto-adding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawIsbn = params.get("addIsbn");
    if (!rawIsbn) return;

    // Normaliseer ISBN: alleen cijfers en X behouden
    const normalizedIsbn = rawIsbn.replace(/[^0-9X]/gi, "").trim();
    if (!normalizedIsbn) {
      router.replace("/library");
      return;
    }

    // Voorkom dat hetzelfde ISBN meerdere keren wordt verwerkt
    if (handledIsbnRef.current === normalizedIsbn) {
      return;
    }
    handledIsbnRef.current = normalizedIsbn;

    setPendingIsbn(normalizedIsbn);
    setAddModalOpen(true);
    setAddLoading(true);
    setTargetShelfId(getActiveShelfId() || ensureDefaultShelf().id);

    (async () => {
      try {
        const data = await lookupByIsbn(normalizedIsbn);
        setPendingData({
          title: data.title || "Onbekend",
          authors: data.authors || [],
          coverUrl: data.coverUrl || "",
        });
      } catch (e) {
        console.error("Failed to lookup ISBN:", e);
        setPendingData({
          title: "Onbekend",
          authors: [],
          coverUrl: "",
        });
      } finally {
        setAddLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    // Ensure default shelves exist
    ensureDefaultShelves();

    // Load shelves
    const allShelves = loadShelves();
    setShelves(allShelves);

    // Get active shelf ID
    const activeId = getActiveShelfId();
    setActiveShelfIdState(activeId);

    // Load books and migrate any without shelfId to default shelf
    ensureDefaultShelves(); // Ensure default shelves exist
    const allBooks = loadBooks();
    const defaultShelfId = getActiveShelfId() || ensureDefaultShelf().id;

    // If we previously confirmed an Open Library cover is missing, strip any stale
    // `default=false` Open Library coverUrl to avoid repeated 404 console spam.
    const hasOlMissingFlag = (isbn13: string) => {
      try {
        return Boolean(localStorage.getItem(`se:olCoverMissing:${isbn13}`));
      } catch {
        return false;
      }
    };
    const stripStaleOpenLibraryCover = (b: Book) => {
      if (!b.coverUrl) return b;
      if (!b.isbn13) return b;
      if (!b.coverUrl.includes("covers.openlibrary.org")) return b;
      if (!b.coverUrl.includes("default=false")) return b;
      if (!hasOlMissingFlag(b.isbn13)) return b;
      return { ...b, coverUrl: "" };
    };
    let didStrip = false;
    const cleanedBooks = allBooks.map((b) => {
      const next = stripStaleOpenLibraryCover(b);
      if (next !== b) didStrip = true;
      return next;
    });

    const needsMigration = cleanedBooks.some((b) => !b.shelfId);
    if (needsMigration) {
      const migrated = cleanedBooks.map((b) => ({
        ...b,
        shelfId: b.shelfId || defaultShelfId,
        updatedAt: b.updatedAt || Date.now(),
      }));
      saveBooks(migrated);
      setBooks(migrated);
    } else {
      // Persist cleanup if we changed anything
      if (didStrip) saveBooks(cleanedBooks);
      setBooks(cleanedBooks);
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

  // Base books for filtering (shelf or all)
  const baseBooks = useMemo(() => {
    return scope === "all" ? books : activeBooks;
  }, [scope, books, activeBooks]);

  // Filter and search
  const visibleBooks = useMemo(() => {
    let filtered = baseBooks;

    // Status filter
    if (statusFilter.size > 0 && statusFilter.size < 3) {
      filtered = filtered.filter((b) => {
        const status = b.status ?? "TBR";
        return statusFilter.has(status);
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const words = query.split(/\s+/).filter(Boolean);
      
      filtered = filtered.filter((b) => {
        const title = (b.title || "").toLowerCase();
        const authors = (b.authors || []).join(" ").toLowerCase();
        const isbn = (b.isbn13 || "").toLowerCase();
        const searchText = `${title} ${authors} ${isbn}`;
        
        return words.every((word) => searchText.includes(word));
      });
    }

    // Sort
    const sorted = [...filtered];
    if (sortBy === "title") {
      sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "author") {
      sorted.sort((a, b) => {
        const aAuthor = (a.authors || [])[0] || "";
        const bAuthor = (b.authors || [])[0] || "";
        return aAuthor.localeCompare(bAuthor);
      });
    } else {
      // recent (default) - sort by updatedAt desc
      sorted.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }

    return sorted;
  }, [baseBooks, statusFilter, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const tbr = activeBooks.filter((b) => (b.status ?? "TBR") === "TBR").length;
    const reading = activeBooks.filter((b) => (b.status ?? "TBR") === "Reading").length;
    const read = activeBooks.filter((b) => (b.status ?? "TBR") === "Finished").length;

    return { total: activeBooks.length, tbr, reading, read };
  }, [activeBooks]);

  // Show Share Shelfie only if total books >= 2 and add modal is not open
  const showShareButton = stats.total >= 2 && !addModalOpen;

  function handleShelfSelect(shelfId: string) {
    setActiveShelfId(shelfId);
    setActiveShelfIdState(shelfId);
    setShowShelfDropdown(false);
  }

  function suggestEmojiFromName(name: string): string | null {
    const n = name.toLowerCase();

    const has = (...words: string[]) => words.some((w) => n.includes(w));

    // Romantasy / Fantasy
    if (has("romantasy", "fantasy", "fae", "fairy", "magic", "mage", "witch", "wizard", "dragon", "court", "kingdom", "throne")) {
      if (has("dragon")) return "🐉";
      if (has("court", "kingdom", "throne")) return "🏰";
      return "🧙";
    }

    // Romance / spicy
    if (has("romance", "love", "spicy", "smut", "spice", "steam", "steamy", "hot", "trope")) {
      if (has("spicy", "smut", "steam", "steamy", "hot")) return "🔥";
      return "💖";
    }

    // Thriller / mystery
    if (has("thriller", "mystery", "crime", "detective", "murder", "case", "noir")) {
      if (has("detective", "case")) return "🕵️";
      if (has("murder")) return "🔪";
      return "🧩";
    }

    // Horror / dark
    if (has("horror", "dark", "gothic", "haunted", "vampire", "ghost", "curse", "cursed")) {
      if (has("dark")) return "🖤";
      if (has("gothic", "haunted", "ghost")) return "🕯️";
      return "🌙";
    }

    // Cozy / comfort / seizoenen
    if (has("cozy", "comfort", "autumn", "fall", "winter", "summer", "spring")) {
      if (has("autumn", "fall")) return "🍂";
      if (has("winter")) return "❄️";
      if (has("summer")) return "🌞";
      if (has("spring")) return "🌷";
      return "☕";
    }

    // Sci-fi / space
    if (has("sci-fi", "scifi", "space", "alien", "galaxy", "planet", "cyberpunk")) {
      if (has("planet", "galaxy")) return "🪐";
      return "🚀";
    }

    // Self-help / growth
    if (has("self help", "self-help", "growth", "mindset", "habits", "wellbeing", "healing")) return "🌱";

    // Manga / comics
    if (has("manga", "comics", "graphic")) return "💥";

    // Sad / tears
    if (has("sad", "cry", "crying", "tears", "tearjerker")) return "😭";

    // Default-ish
    if (n.trim().length >= 3) return "📚";
    return null;
  }

  // Auto-suggest emoji when name changes (only if emoji not touched)
  useEffect(() => {
    const s = suggestEmojiFromName(name);
    setSuggestedEmoji(s);

    if (!emojiTouched && s) {
      setEmoji(s);
    }
  }, [name, emojiTouched]);

  function handleCreateShelf() {
    const nameTrimmed = name.trim();
    if (!nameTrimmed || nameTrimmed.length > 24) return;

    // Validate emoji - fallback to 📚 if empty
    const emojiTrimmed = emoji.trim() || "📚";

    const shelf = createShelf(nameTrimmed, emojiTrimmed);
    const updatedShelves = loadShelves();
    setShelves(updatedShelves);
    setActiveShelfIdState(shelf.id);
    setShowNewShelfModal(false);
    setName("");
    setEmoji("📚");
    setEmojiTouched(false);
    setSuggestedEmoji(null);
  }

  function handleCreateShelfInAddModal() {
    const nameTrimmed = newShelfName.trim();
    if (!nameTrimmed || nameTrimmed.length > 24) return;

    const emojiTrimmed = newShelfEmoji.trim() || "📚";
    // Use current mood for new shelf in add modal
    const currentMood = getMood();
    const shelfMood: Mood = currentMood === "default" ? "aesthetic" : currentMood;
    const shelf = createShelf(nameTrimmed, emojiTrimmed, shelfMood);
    const updatedShelves = loadShelves();
    setShelves(updatedShelves);
    setTargetShelfId(shelf.id);
    setShowNewShelfInAddModal(false);
    setNewShelfName("");
    setNewShelfEmoji("📚");
  }

  function handleAddBookToShelf() {
    if (!pendingIsbn || !targetShelfId) return;

    const now = Date.now();
    const book: Book = {
      id: pendingIsbn,
      isbn13: pendingIsbn,
      title: pendingData?.title || "Onbekend",
      authors: pendingData?.authors || [],
      coverUrl: pendingData?.coverUrl || "",
      shelfId: targetShelfId,
      status: "TBR" as BookStatus,
      addedAt: now,
      updatedAt: now,
    };

    upsertBook(book);
    handleBookAdded();
    showToast("Boek toegevoegd aan je shelf ✨");
    
    // Reset state and clean URL
    setAddModalOpen(false);
    setPendingIsbn(null);
    setPendingData(null);
    setTargetShelfId(null);
    handledIsbnRef.current = null;
    router.replace("/library");
  }

  function handleCancelAddBook() {
    setAddModalOpen(false);
    setPendingIsbn(null);
    setPendingData(null);
    setTargetShelfId(null);
    setShowNewShelfInAddModal(false);
    setNewShelfName("");
    setNewShelfEmoji("📚");
    handledIsbnRef.current = null;
    router.replace("/library");
  }

  function handleMoveBook(bookId: string, targetShelfId: string) {
    updateBook(bookId, { shelfId: targetShelfId });
    const updated = loadBooks();
    setBooks(updated);
    setActionMenuBookId(null);
  }

  function handleChangeStatus(bookId: string, status: BookStatus) {
    const updated = updateBook(bookId, { status });
    setBooks(updated);
    showToast(`Status updated to ${status === "Finished" ? "Read" : status}`);
  }

  function handleChangeFormat(bookId: string, format: BookFormat) {
    updateBook(bookId, { format });
    const updated = loadBooks();
    setBooks(updated);
    setActionMenuBookId(null);
    showToast(`Format updated to ${format === "ebook" ? "E-book" : "Physical book"}`);
  }

  function handleDeleteBook(bookId: string) {
    deleteBook(bookId);
    const updated = loadBooks();
    setBooks(updated);
    setActionMenuBookId(null);
    setShowDeleteConfirm(null);
  }

  function handleCoverError(bookId: string) {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    
    console.warn("Cover image error for book:", book.title, "URL:", book.coverUrl);
    
    // Only clear non-Open Library URLs (they might be broken)
    // For Open Library, we keep the URL even if it's a placeholder
    // because the placeholder is better than nothing
    if (book.coverUrl && !book.coverUrl.includes("covers.openlibrary.org")) {
      console.log("Clearing broken cover URL (not Open Library)");
      updateBook(bookId, { coverUrl: "", updatedAt: Date.now() });
      const updated = loadBooks();
      setBooks(updated);
    } else {
      console.log("Keeping Open Library URL (even if placeholder)");
    }
  }

  async function handleSearchCover(bookId: string) {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    setActionMenuBookId(null);
    setCoverPreviewLoading(true);
    
    try {
      const data = await lookupByIsbn(book.isbn13);
      const newCoverUrl = data.coverUrl || "";
      
      console.log("Searching cover for book:", book.title, "ISBN:", book.isbn13);
      console.log("Found cover URL:", newCoverUrl);
      
      if (newCoverUrl) {
        const httpsUrl = toHttps(newCoverUrl);
        console.log("Opening cover preview modal with URL:", httpsUrl);
        // Open preview modal instead of saving directly
        setCoverPreview({
          bookId,
          coverUrl: httpsUrl,
          title: book.title,
        });
      } else {
        showToast("Geen cover gevonden");
      }
    } catch (error) {
      console.error("Failed to search cover:", error);
      showToast("Fout bij zoeken cover");
    } finally {
      setCoverPreviewLoading(false);
    }
  }

  function handleSaveCover() {
    if (!coverPreview) return;
    
    const now = Date.now();
    const { bookId, coverUrl } = coverPreview;
    
    // Update book in storage
    updateBook(bookId, {
      coverUrl,
      updatedAt: now,
    });
    
    // Update state
    const updated = loadBooks();
    setBooks(updated.map(b => b.id === bookId ? { ...b, coverUrl, updatedAt: now } : b));
    
    showToast("Cover opgeslagen ✨");
    setCoverPreview(null);
  }

  function handleCloseCoverPreview() {
    setCoverPreview(null);
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
            // Always respect lookup result (even if empty) so stale/broken URLs get cleared.
            coverUrl: data.coverUrl,
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

  async function handleShareShelf() {
    if (!shareCardRef.current || !activeShelf) return;

    setSharing(true);
    try {
      const title = `${activeShelf.emoji || "📚"} ${activeShelf.name}`;
      const isMobile =
        typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // html-to-image inlines external images via fetch; only include covers that are CORS-fetchable.
      async function canUseCover(url: string) {
        try {
          const res = await fetch(url, { mode: "cors", cache: "no-store" });
          if (!res.ok) return false;
          const ct = res.headers.get("content-type") || "";
          return ct.startsWith("image/");
        } catch {
          return false;
        }
      }

      const picked: string[] = [];
      const seen = new Set<string>();

      for (const b of activeBooks) {
        if (picked.length >= 6) break;

        const candidates = [
          // IMPORTANT: do not synthesize Open Library URLs here; it produces 404 spam
          // (and the ShareCard already has placeholders for missing covers).
          b.coverUrl ? toHttps(b.coverUrl) : "",
        ].filter(Boolean);

        for (const url of candidates) {
          if (picked.length >= 6) break;
          if (seen.has(url)) continue;
          seen.add(url);
          if (await canUseCover(url)) {
            picked.push(url);
            break; // use first working candidate per book
          }
        }
      }

      // Update the hidden ShareCard contents (covers) before capture.
      setShareCoverUrls(picked);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const blob = await toBlob(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      if (!blob) return;

      const filename = `${activeShelf.name.replace(/\s+/g, "-")}-shelf.png`;
      const caption = `✨ My ${activeShelf.emoji || "📚"} ${activeShelf.name} shelf update!
📚 Total: ${stats.total} | TBR: ${stats.tbr} | Reading: ${stats.reading} | Read: ${stats.read}
What should I add next? 👀
#BookTok #TBR #ReadingCommunity #Shelfie #Bookish`;

      // Mobile: try native share sheet with file
      setShareBlob(blob);
      setShareFilename(filename);
      setShareCaption(caption);
      setCopyImageStatus("idle");
      setCopyCaptionStatus("idle");

      if (isMobile && navigator.share) {
        const file = new File([blob], filename, { type: "image/png" });
        if ((navigator as any).canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              title,
              text: caption,
              files: [file],
            });
            return;
          } catch {
            // If user cancels or share fails, open modal for download/copy.
          }
        }
      }

      // Desktop (or fallback): show options modal
      setShareModalOpen(true);
    } catch (error) {
      console.error("Failed to generate share card:", error);
    } finally {
      setSharing(false);
    }
  }

  function downloadImage(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const activeShelf = shelves.find((s) => s.id === activeShelfId);

  // Get first few covers for blurred background
  const shelfCovers = useMemo(() => {
    return activeBooks
      // IMPORTANT: do not synthesize Open Library URLs here (it causes 404 spam).
      // Only use already-known cover URLs; otherwise show the normal gradient background.
      .filter((b) => Boolean(b.coverUrl) && !String(b.coverUrl).includes("covers.openlibrary.org"))
      .slice(0, 3)
      .map((b) => toHttps(b.coverUrl || ""));
  }, [activeBooks]);

  return (
    <main style={page}>

      {/* Shelf Header with blurred background */}
      <div style={shelfHeader}>
        {shelfCovers.length > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${shelfCovers[0]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(40px) brightness(0.4)",
              transform: "scale(1.1)",
              zIndex: 0,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              typeof document !== "undefined" && document.documentElement.dataset.mood === "calm"
                ? "var(--panel)" // Calm mood: no gradients, just plain panel color
                : typeof document !== "undefined" && document.documentElement.dataset.mood === "bold"
                ? shelfCovers.length > 0
                  ? "linear-gradient(135deg, rgba(255,138,0,0.15), rgba(255,138,0,0.08) 45%, rgba(0,0,0,0.85) 70%)"
                  : "var(--bg2)"
                : typeof document !== "undefined" && document.documentElement.dataset.mood === "default"
                ? shelfCovers.length > 0
                  ? "linear-gradient(135deg, rgba(109,94,252,0.35), rgba(255,73,240,0.20) 45%, rgba(0,0,0,0.7) 70%)"
                  : "linear-gradient(135deg, rgba(109,94,252,0.20), rgba(255,73,240,0.12) 45%, rgba(0,0,0,0.0) 70%), var(--bg2)"
                : shelfCovers.length > 0
                ? "linear-gradient(135deg, rgba(109,94,252,0.35), rgba(255,73,240,0.20) 45%, rgba(0,0,0,0.7) 70%)"
                : "linear-gradient(135deg, rgba(109,94,252,0.22), rgba(255,73,240,0.10) 45%, rgba(0,0,0,0) 70%), #121218",
            zIndex: 0,
          }}
        />
        <div style={{ ...shelfHeaderContent, position: "relative", zIndex: 10000 }}>
          <div style={{ position: "relative", display: "inline-block" }} ref={dropdownRef}>
            <button style={shelfSelector} onClick={() => setShowShelfDropdown(!showShelfDropdown)}>
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
              <span style={statLabel}>Read</span>
            </div>
          </div>
        </div>

        <div
          style={{
            ...actions,
            position: "relative",
            zIndex: 1,
            pointerEvents: showShelfDropdown ? "none" : "auto",
          }}
        >
          <button style={btnGhost} onClick={refreshCovers} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh covers"}
          </button>

          {/* Only show Share Shelfie if total books >= 2 and add modal is not open */}
          {showShareButton && (
            <button
              style={btnGhost}
              onClick={handleShareShelf}
              disabled={sharing || !activeShelf || activeBooks.length === 0}
              aria-label={sharing ? "Generating share image" : "Share Shelfie"}
              title={sharing ? "Generating…" : "Share Shelfie"}
            >
              {sharing ? "Generating…" : "Share Shelfie"}
            </button>
          )}

        <Link href="/scan">
          <button style={btnPrimary}>+ Scan</button>
        </Link>
        </div>
      </div>

      {/* Hidden Share Card for rendering */}
      {activeShelf && (() => {
        const currentMood = typeof document !== "undefined" ? document.documentElement.dataset.mood : "default";
        const shareVariant: "aesthetic" | "bold" = currentMood === "bold" ? "bold" : "aesthetic";
        return (
          <div style={{ position: "fixed", left: "-10000px", top: 0, opacity: 0, pointerEvents: "none" }}>
            <ShareCard
              ref={shareCardRef}
              mode="shelfie"
              shelf={activeShelf}
              coverUrls={shareCoverUrls}
              variant={shareVariant}
              stats={stats}
            />
          </div>
        );
      })()}

      {shareModalOpen && (
        <div
          style={modalOverlay}
          onClick={() => {
            setShareModalOpen(false);
          }}
        >
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>Share Shelfie</h2>

            <p style={{ margin: "6px 0 12px", color: "var(--muted)", fontWeight: 700 }}>
              Tip: On mobile you'll get the native share sheet.
            </p>

            <div style={{ display: "grid", gap: 10 }}>
              <button
                style={btnPrimary}
                onClick={() => {
                  if (!shareBlob || !shareFilename) return;
                  downloadImage(shareBlob, shareFilename);
                }}
              >
                Download PNG
              </button>

              <button
                style={btnGhost}
                disabled={
                  !shareBlob ||
                  !(navigator as any)?.clipboard?.write ||
                  typeof (window as any)?.ClipboardItem === "undefined"
                }
                onClick={async () => {
                  if (!shareBlob) return;
                  try {
                    const ClipboardItemCtor = (window as any).ClipboardItem;
                    await (navigator as any).clipboard.write([
                      new ClipboardItemCtor({ "image/png": shareBlob }),
                    ]);
                    setCopyImageStatus("copied");
                    window.setTimeout(() => setCopyImageStatus("idle"), 1500);
                  } catch {
                    setCopyImageStatus("failed");
                  }
                }}
                title={
                  (navigator as any)?.clipboard?.write && typeof (window as any)?.ClipboardItem !== "undefined"
                    ? "Copy image to clipboard"
                    : "Copy not supported in this browser"
                }
              >
                {copyImageStatus === "copied"
                  ? "Copied!"
                  : copyImageStatus === "failed"
                    ? "Copy failed"
                    : "Copy image"}
              </button>

              <button
                style={btnGhost}
                disabled={!shareCaption || !(navigator as any)?.clipboard?.writeText}
                onClick={async () => {
                  if (!shareCaption) return;
                  try {
                    await (navigator as any).clipboard.writeText(shareCaption);
                    setCopyCaptionStatus("copied");
                    window.setTimeout(() => setCopyCaptionStatus("idle"), 1500);
                  } catch {
                    setCopyCaptionStatus("failed");
                  }
                }}
                title={(navigator as any)?.clipboard?.writeText ? "Copy caption" : "Copy caption not supported"}
              >
                {copyCaptionStatus === "copied"
                  ? "Copied caption!"
                  : copyCaptionStatus === "failed"
                    ? "Copy caption failed"
                    : "Copy caption"}
              </button>

              <button
                style={btnGhost}
                onClick={() => {
                  const url = "https://www.tiktok.com/upload?lang=en";
                  const w = window.open(url, "_blank", "noopener,noreferrer");
                  if (!w) window.open("https://www.tiktok.com/", "_blank", "noopener,noreferrer");
                }}
              >
                Open TikTok (web)
              </button>

              <button
                style={btnGhost}
                disabled={!shareBlob || !navigator.share}
                onClick={async () => {
                  if (!shareBlob) return;
                  if (!navigator.share) return;
                  const file = new File([shareBlob], shareFilename || "shelf.png", { type: "image/png" });
                  if ((navigator as any).canShare?.({ files: [file] })) {
                    try {
                      await navigator.share({
                        title: "ShelfieEase",
                        text: shareCaption || "Sharing my Shelfie",
                        files: [file],
                      });
                    } catch {
                      // ignore
                    }
                  }
                }}
                title="Open system share (optional)"
              >
                Open system share
              </button>

              <button style={btnGhost} onClick={() => setShareModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewShelfModal && (
        <div
          style={modalOverlay}
          onClick={() => {
            setShowNewShelfModal(false);
            setEmojiTouched(false);
            setName("");
            setEmoji("📚");
            setSuggestedEmoji(null);
            // Reset mood to current mood for next time
            const currentMood = getMood();
            setNewShelfMood(currentMood === "default" ? "aesthetic" : currentMood);
          }}
        >
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>New Shelf</h2>
            <div style={modalForm}>
              <div style={formGroup}>
                <label htmlFor="new-shelf-name" style={formLabel}>Name</label>
                <input
                  id="new-shelf-name"
                  name="new-shelf-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value.slice(0, 24));
                    // Reset emojiTouched when name is cleared
                    if (!e.target.value.trim()) setEmojiTouched(false);
                  }}
                  placeholder="My Shelf"
                  maxLength={24}
                  style={formInput}
                  autoFocus
                />
                <div style={formHint}>{name.length}/24</div>
                {suggestedEmoji && !emojiTouched && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
                    Suggested emoji: <span style={{ fontSize: 16 }}>{suggestedEmoji}</span>
                  </div>
                )}
              </div>

              <div style={formGroup}>
                <label htmlFor="new-shelf-emoji" style={formLabel}>Emoji</label>
                <div style={emojiPicker}>
                  {(() => {
                    const defaultEmojis = ["📚", "✨", "🔥", "💖", "🧙", "🗡️", "🌙", "🧋", "😭", "🕯️", "🏰", "🐉"];
                    const emojisToShow = suggestedEmoji
                      ? [suggestedEmoji, ...defaultEmojis.filter((e) => e !== suggestedEmoji)]
                      : defaultEmojis;

                    return emojisToShow.map((emojiOption) => (
                      <button
                        key={emojiOption}
                        type="button"
                        style={{
                          ...emojiChip,
                          ...(emoji === emojiOption ? emojiChipActive : {}),
                        }}
                        onClick={() => {
                          setEmojiTouched(true);
                          setEmoji(emojiOption);
                        }}
                      >
                        {emojiOption}
                      </button>
                    ));
                  })()}
                </div>

                <input
                  id="new-shelf-emoji"
                  name="new-shelf-emoji"
                  type="text"
                  value={emoji}
                  onChange={(e) => {
                    setEmojiTouched(true);
                    const val = e.target.value.slice(0, 2);
                    setEmoji(val.trim() ? val : "📚");
                  }}
                  onBlur={(e) => {
                    if (!e.target.value.trim()) {
                      setEmoji("📚");
                    }
                  }}
                  placeholder="📚"
                  style={{ ...formInput, marginTop: 8 }}
                  maxLength={2}
                />
              </div>

              <div style={modalActions}>
                <button
                  style={btnGhost}
                  onClick={() => {
                    setShowNewShelfModal(false);
                    setEmojiTouched(false);
                    setName("");
                    setEmoji("📚");
                    setSuggestedEmoji(null);
                    // Reset mood to current mood for next time
                    const currentMood = getMood();
                    setNewShelfMood(currentMood === "default" ? "aesthetic" : currentMood);
                  }}
                >
                  Cancel
                </button>
                <button style={btnPrimary} onClick={handleCreateShelf} disabled={!name.trim()}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal - Mobile-first bottom sheet */}
      {addModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 10000,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={handleCancelAddBook}
        >
          <div
            style={{
              background: "var(--bg)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              width: "100%",
              maxWidth: 480,
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "24px 20px",
              boxShadow: "0 -8px 32px var(--shadow)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet handle */}
            <div
              style={{
                width: 40,
                height: 4,
                background: "var(--border)",
                borderRadius: 2,
                margin: "0 auto 20px",
              }}
            />

            <h2
              style={{
                margin: "0 0 20px",
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              Boek toevoegen
            </h2>

            {addLoading ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)" }}>
                Bezig met ophalen...
              </div>
            ) : (
              <>
                {pendingData && (
                  <div
                    style={{
                      marginBottom: 24,
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "var(--panel2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {/* Title */}
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--text)",
                        marginBottom: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      {pendingData.title || "Onbekend"}
                    </div>

                    {/* Authors */}
                    {pendingData.authors && pendingData.authors.length > 0 && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--muted)",
                          lineHeight: 1.4,
                        }}
                      >
                        {pendingData.authors.join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {!showNewShelfInAddModal ? (
                  <>
                    <div style={{ ...formGroup, marginBottom: 20 }}>
                      <label htmlFor="add-book-shelf" style={{ ...formLabel, color: "var(--text)" }}>Kies een shelf</label>
                      <select
                        id="add-book-shelf"
                        name="add-book-shelf"
                        value={targetShelfId || ""}
                        onChange={(e) => setTargetShelfId(e.target.value)}
                        style={{
                          ...formInput,
                          border: "1px solid var(--border)",
                          background: "var(--panel2)",
                          color: "var(--text)",
                        }}
                      >
                        {shelves.map((shelf) => (
                          <option key={shelf.id} value={shelf.id}>
                            {shelf.emoji} {shelf.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <button
                        style={{
                          ...btnGhost,
                          width: "100%",
                          justifyContent: "center",
                        }}
                        onClick={() => setShowNewShelfInAddModal(true)}
                      >
                        + Nieuwe shelf
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        paddingTop: 16,
                        borderTop: "1px solid var(--border)",
                        marginTop: "auto",
                      }}
                    >
                      <button
                        style={{
                          ...btnGhost,
                          flex: 1,
                          justifyContent: "center",
                        }}
                        onClick={handleCancelAddBook}
                      >
                        Annuleren
                      </button>
                      <button
                        style={{
                          ...btnPrimary,
                          flex: 1,
                          justifyContent: "center",
                        }}
                        onClick={handleAddBookToShelf}
                        disabled={!targetShelfId}
                      >
                        Zet in deze shelf
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={modalForm}>
                    <div style={formGroup}>
                      <label htmlFor="add-book-new-shelf-name" style={{ ...formLabel, color: "var(--text)" }}>Naam</label>
                      <input
                        id="add-book-new-shelf-name"
                        name="add-book-new-shelf-name"
                        type="text"
                        value={newShelfName}
                        onChange={(e) => setNewShelfName(e.target.value.slice(0, 24))}
                        placeholder="My Shelf"
                        maxLength={24}
                        style={{
                          ...formInput,
                          border: "1px solid var(--border)",
                          background: "var(--panel2)",
                          color: "var(--text)",
                        }}
                        autoFocus
                      />
                    </div>
                    <div style={formGroup}>
                      <label htmlFor="add-book-new-shelf-emoji" style={{ ...formLabel, color: "var(--text)" }}>Emoji</label>
                      <input
                        id="add-book-new-shelf-emoji"
                        name="add-book-new-shelf-emoji"
                        type="text"
                        value={newShelfEmoji}
                        onChange={(e) => setNewShelfEmoji(e.target.value.slice(0, 2) || "📚")}
                        placeholder="📚"
                        maxLength={2}
                        style={{
                          ...formInput,
                          border: "1px solid var(--border)",
                          background: "var(--panel2)",
                          color: "var(--text)",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        paddingTop: 16,
                        borderTop: "1px solid var(--border)",
                        marginTop: 8,
                      }}
                    >
                      <button
                        style={{
                          ...btnPrimary,
                          flex: 1,
                          justifyContent: "center",
                        }}
                        onClick={handleCreateShelfInAddModal}
                        disabled={!newShelfName.trim()}
                      >
                        Maak shelf
                      </button>
                      <button
                        style={{
                          ...btnGhost,
                          flex: 1,
                          justifyContent: "center",
                        }}
                        onClick={() => {
                          setShowNewShelfInAddModal(false);
                          setNewShelfName("");
                          setNewShelfEmoji("📚");
                        }}
                      >
                        Terug
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={modalOverlay} onClick={() => setShowDeleteConfirm(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>Boek verwijderen?</h2>
            <p style={{ color: "var(--muted)", margin: "0 0 24px" }}>Deze actie kan niet ongedaan worden gemaakt.</p>
            <div style={modalActions}>
              <button style={btnGhost} onClick={() => setShowDeleteConfirm(null)}>
                Annuleren
              </button>
              <button
                style={{ ...btnPrimary, background: "var(--danger)", color: "#fff" }}
                onClick={() => handleDeleteBook(showDeleteConfirm)}
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      {coverPreview && (
        <div style={modalOverlay} onClick={handleCloseCoverPreview}>
          <div 
            style={{
              ...modal,
              maxWidth: 400,
              padding: 24,
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={modalTitle}>Cover gevonden</h2>
            <p style={{ color: "var(--muted)", margin: "0 0 20px", fontSize: 14 }}>
              {coverPreview.title}
            </p>
            <div
              style={{
                width: "100%",
                aspectRatio: "2 / 3",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--border)",
                background: "var(--panel2)",
                marginBottom: 24,
                position: "relative",
                minHeight: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                key={`cover-preview-${coverPreview.coverUrl}`}
                src={toHttps(coverPreview.coverUrl)}
                alt={coverPreview.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "block",
                }}
                onLoad={(e) => {
                  console.log("Cover preview image loaded successfully:", coverPreview.coverUrl);
                  console.log("Image dimensions:", {
                    naturalWidth: e.currentTarget.naturalWidth,
                    naturalHeight: e.currentTarget.naturalHeight,
                    clientWidth: e.currentTarget.clientWidth,
                    clientHeight: e.currentTarget.clientHeight,
                    src: e.currentTarget.src,
                  });
                }}
                onError={(e) => {
                  console.error("Cover preview image error:", coverPreview.coverUrl, e);
                  console.error("Image element:", {
                    src: e.currentTarget.src,
                    complete: e.currentTarget.complete,
                    naturalWidth: e.currentTarget.naturalWidth,
                    naturalHeight: e.currentTarget.naturalHeight,
                  });
                  showToast("Fout bij laden cover");
                  // Don't close modal automatically, let user decide
                }}
              />
            </div>
            <div style={modalActions}>
              <button style={btnGhost} onClick={handleCloseCoverPreview}>
                Sluiten
              </button>
              <button style={btnPrimary} onClick={handleSaveCover}>
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {coverPreviewLoading && (
        <div style={modalOverlay}>
          <div 
            style={{
              ...modal,
              maxWidth: 300,
              padding: 24,
            }} 
          >
            <p style={{ color: "var(--text)", margin: 0, textAlign: "center" }}>
              Cover zoeken...
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {activeBooks.length > 0 && (
        <div style={{ padding: "0 16px 16px", display: "grid", gap: 12 }}>
          {/* Search input */}
          <div style={{ position: "relative" }}>
            <input
              id="book-search"
              name="book-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek op titel, auteur of ISBN"
              aria-label="Zoek op titel, auteur of ISBN"
              style={{
                width: "100%",
                padding: "12px 16px",
                paddingRight: searchQuery ? "40px" : "16px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--panel2)",
                color: "var(--text)",
                fontSize: 16,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  border: "none",
                  background: "var(--btnGhostBg)",
                  color: "var(--muted)",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Scope toggle and filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {/* Scope toggle */}
            <div style={{ display: "flex", gap: 4, borderRadius: 12, padding: 2, background: "var(--btnGhostBg)", border: "1px solid var(--border)" }}>
              <button
                type="button"
                onClick={() => setScope("shelf")}
                style={{
                  padding: "6px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: scope === "shelf" ? "var(--accentSoft)" : "transparent",
                  color: scope === "shelf" ? "var(--text)" : "var(--muted)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                This shelf
              </button>
              <button
                type="button"
                onClick={() => setScope("all")}
                style={{
                  padding: "6px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: scope === "all" ? "var(--accentSoft)" : "transparent",
                  color: scope === "all" ? "var(--text)" : "var(--muted)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                All shelves
              </button>
            </div>

            {/* Status filters */}
            {(["TBR", "Reading", "Finished"] as BookStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  const newFilter = new Set(statusFilter);
                  if (newFilter.has(status)) {
                    newFilter.delete(status);
                  } else {
                    newFilter.add(status);
                  }
                  setStatusFilter(newFilter);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 12,
                  border: statusFilter.has(status)
                    ? "1px solid var(--accent1)"
                    : "1px solid var(--border)",
                  background: statusFilter.has(status)
                    ? "var(--accentSoft)"
                    : "var(--btnGhostBg)",
                  color: statusFilter.has(status) ? "var(--text)" : "var(--muted)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                {status === "TBR" ? "TBR" : status === "Reading" ? "Reading" : "Finished"}
              </button>
            ))}

            {/* Sort dropdown */}
            <select
              id="book-sort"
              name="book-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "title" | "author")}
              aria-label="Sorteer boeken"
              style={{
                padding: "6px 12px",
                paddingRight: 32,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--btnGhostBg)",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 4L6 8L10 4' stroke='currentColor' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
              }}
            >
              <option value="recent">Sort: Recent</option>
              <option value="title">Sort: Title A–Z</option>
              <option value="author">Sort: Author A–Z</option>
            </select>
          </div>
        </div>
      )}

      {activeBooks.length === 0 ? (
        <div style={emptyCard}>
          <p style={{ color: "var(--muted)", marginTop: 0, fontWeight: 700 }}>No books yet. Time to scan 📚✨</p>
          <Link href="/scan">
            <button style={btnPrimary}>Scan your first book</button>
          </Link>
        </div>
      ) : visibleBooks.length === 0 ? (
        <div style={emptyCard}>
          <p style={{ color: "var(--muted)", marginTop: 0, fontWeight: 700 }}>Geen boeken gevonden</p>
          <p style={{ color: "var(--muted2)", marginTop: 8, fontSize: 14 }}>Check je filters of zoekterm.</p>
        </div>
      ) : (
        <div style={grid}>
          {visibleBooks.map((b, idx) => {
            // Debug: log coverUrl for books
            if (idx === 0 && b.coverUrl) {
              console.log("Rendering book with cover:", b.title, "coverUrl:", b.coverUrl);
            }
            const isRecentlyAdded = idx === 0; // First card is the most recently added
            const cardStyle = isRecentlyAdded ? cardCompact : card;
            const buttonStyle = isRecentlyAdded ? actionButtonCompact : actionButton;
            const titleStyle = isRecentlyAdded ? titleCompact : title;
            const authorStyle = isRecentlyAdded ? authorCompact : author;
            const coverWrapStyle = isRecentlyAdded ? coverWrapCompact : coverWrap;
            const bookShelf = shelves.find((s) => s.id === b.shelfId);

            return (
              <div key={b.id} style={{ ...cardStyle, animationDelay: `${idx * 35}ms`, position: "relative" }}>
                <button
                  style={buttonStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionMenuBookId(actionMenuBookId === b.id ? null : b.id);
                  }}
                >
                  ⋯
                </button>

                {actionMenuBookId === b.id && (
                  <>
                    <div style={actionMenuOverlay} onClick={() => setActionMenuBookId(null)} />
                    <div
                      ref={(el) => {
                        actionMenuRefs.current[b.id] = el;
                      }}
                      style={actionMenu}
                    >
                      <div style={actionMenuHandle} />
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
                            <span>{status === "Finished" ? "Read" : status}</span>
                            {b.status === status && <span style={{ fontSize: 10 }}>✓</span>}
                          </button>
                        ))}
                      </div>

                      <div style={actionMenuDivider} />

                      <div style={actionMenuSection}>
                        <div style={actionMenuLabel}>Book format</div>
                        {(["physical", "ebook"] as BookFormat[]).map((format) => (
                          <button
                            key={format}
                            style={{
                              ...actionMenuItem,
                              ...((b.format || "physical") === format ? actionMenuItemActive : {}),
                            }}
                            onClick={() => handleChangeFormat(b.id, format)}
                          >
                            <span>{format === "ebook" ? "📱 E-book" : "📖 Physical book"}</span>
                            {(b.format || "physical") === format && <span style={{ fontSize: 10 }}>✓</span>}
                          </button>
                        ))}
                      </div>

                      <div style={actionMenuDivider} />

                      <button
                        style={actionMenuItem}
                        onClick={() => handleSearchCover(b.id)}
                        disabled={coverPreviewLoading}
                      >
                        <span>{coverPreviewLoading ? "⏳ Zoeken..." : "🔍 Zoek cover"}</span>
                      </button>

                      <div style={actionMenuDivider} />

                      <button 
                        style={{ ...actionMenuItem, color: "var(--danger)" }} 
                        onClick={() => {
                          setActionMenuBookId(null);
                          setShowDeleteConfirm(b.id);
                        }}
                      >
                        <span>🗑️ Verwijder boek</span>
                      </button>
                    </div>
                  </>
                )}

                {isRecentlyAdded ? (
                  <div style={coverWrapStyle}>
                    {b.coverUrl ? (
                      <CoverImg
                        key={`cover-${b.id}-${b.coverUrl}-${b.updatedAt || 0}`}
                        src={toHttps(b.coverUrl)}
                        alt={b.title}
                        style={coverImg}
                        onError={() => handleCoverError(b.id)}
                      />
                    ) : null}
                  </div>
                ) : (
                  <Cover
                    key={`cover-${b.id}-${b.coverUrl || ""}-${b.updatedAt || 0}`}
                    isbn13={b.isbn13}
                    coverUrl={b.coverUrl || ""}
                    title={b.title}
                    authors={b.authors || []}
                    onBadCover={() => handleCoverError(b.id)}
                    updatedAt={b.updatedAt}
                  />
                )}

                <div style={{ display: "grid", gap: isRecentlyAdded ? 4 : 6, marginTop: isRecentlyAdded ? 8 : 10 }}>
                  <div style={titleStyle}>{b.title}</div>
                  {b.authors?.length ? <div style={authorStyle}>by {b.authors.join(", ")}</div> : null}
                  {scope === "all" && bookShelf && (
                    <div style={{
                      marginTop: 2,
                      fontSize: 11,
                      color: "var(--muted2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      <span>{bookShelf.emoji}</span>
                      <span>{bookShelf.name}</span>
                    </div>
                )}

                <div style={metaRow}>
                    {(() => {
                      const s = b.status || "TBR";
                      const label = s === "Finished" ? "Read" : s;
                      return <span style={badgeFor(s)}>{label}</span>;
                    })()}
                    {(b.format || "physical") === "ebook" && (
                      <span style={{
                        fontSize: 11,
                        color: "var(--muted2)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}>
                        📱
                      </span>
                    )}
                    {!isRecentlyAdded && <span style={isbn}>ISBN {b.isbn13}</span>}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* CSS voor animaties + glow */}
      <style>{css}</style>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            padding: "12px 20px",
            borderRadius: 16,
            fontWeight: 700,
            zIndex: 99999,
            backdropFilter: "blur(12px)",
            pointerEvents: "none",
            color: "var(--text)",
            fontSize: 14,
            whiteSpace: "nowrap",
            boxShadow: `0 8px 24px var(--shadow)`,
            opacity: 0.95,
          }}
        >
          {toast}
        </div>
      )}
    </main>
  );
}

function toHttps(url: string) {
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

type ShareCardVariant = "aesthetic" | "bold";
type ShareCardTokens = {
  cardBg: string;
  cardShadow: string;
  titleSize: number;
  titleShadow: string;
  tileBorder: string;
  tileShadow: string;
  tileFilter: string;
  pillBg: string;
  pillBorder: string;
  statNumberSize: number;
  statLabelSize: number;
};

function getShareCardTokens(variant: ShareCardVariant): ShareCardTokens {
  if (variant === "bold") {
    return {
      cardBg:
        "radial-gradient(1100px 900px at 18% 12%, rgba(255,73,240,0.30), rgba(255,73,240,0) 55%), radial-gradient(1100px 900px at 88% 18%, rgba(109,94,252,0.36), rgba(109,94,252,0) 60%), linear-gradient(135deg, rgba(109,94,252,0.30), rgba(255,73,240,0.18) 45%, rgba(0,0,0,0.97) 78%), #06060a",
      cardShadow:
        "0 28px 96px rgba(0,0,0,0.75), 0 0 0 2px rgba(255,255,255,0.07) inset, 0 0 36px rgba(255,73,240,0.06)",
      titleSize: 88,
      titleShadow: "0 20px 46px rgba(0,0,0,0.70)",
      tileBorder: "2px solid rgba(255,255,255,0.18)",
      tileShadow: "0 20px 58px rgba(0,0,0,0.62)",
      tileFilter: "contrast(1.10) saturate(1.10)",
      pillBg: "rgba(255,255,255,0.09)",
      pillBorder: "2px solid rgba(255,255,255,0.14)",
      statNumberSize: 30,
      statLabelSize: 14,
    };
  }

  return {
    cardBg:
      "radial-gradient(1100px 900px at 18% 12%, rgba(255,73,240,0.24), rgba(255,73,240,0) 55%), radial-gradient(1100px 900px at 88% 18%, rgba(109,94,252,0.30), rgba(109,94,252,0) 60%), linear-gradient(135deg, rgba(109,94,252,0.20), rgba(255,73,240,0.12) 45%, rgba(0,0,0,0.92) 78%), #090910",
    cardShadow:
      "0 24px 88px rgba(0,0,0,0.68), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 70px rgba(255,73,240,0.10)",
    titleSize: 78,
    titleShadow: "0 18px 40px rgba(0,0,0,0.58)",
    tileBorder: "1px solid rgba(255,255,255,0.14)",
    tileShadow: "0 18px 50px rgba(0,0,0,0.55)",
    tileFilter: "none",
    pillBg: "rgba(255,255,255,0.06)",
    pillBorder: "1px solid rgba(255,255,255,0.12)",
    statNumberSize: 26,
    statLabelSize: 14,
  };
}

function ShareCardPreview({ variant }: { variant: ShareCardVariant }) {
  const tokens = getShareCardTokens(variant);
  const isBold = variant === "bold";

  return (
    <div
      aria-label="Share card preview"
      title={variant === "bold" ? "Bold preview" : "Aesthetic preview"}
      style={{
        width: 140,
        height: 250,
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        background: tokens.cardBg,
        boxShadow: "0 14px 36px rgba(0,0,0,0.55)",
        border: isBold ? "2px solid rgba(255,255,255,0.10)" : "1px solid rgba(255,255,255,0.08)",
        flex: "0 0 auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 45%, rgba(0,0,0,0.58) 100%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", padding: 10, display: "grid", gap: 10 }}>
        <div
          style={{
            color: "#fff",
            fontWeight: 950,
            fontSize: isBold ? 13 : 12,
            lineHeight: 1.05,
            textShadow: tokens.titleShadow,
            letterSpacing: isBold ? -0.4 : -0.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          📚 Shelfie
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "2 / 3",
                borderRadius: 10,
                border: tokens.tileBorder,
                boxShadow: "0 8px 18px rgba(0,0,0,0.45)",
                background: "rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Total", "TBR", "Read"].map((label) => (
            <div
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 7px",
                borderRadius: 999,
                background: tokens.pillBg,
                border: tokens.pillBorder,
                color: "rgba(255,255,255,0.85)",
                fontWeight: 900,
                fontSize: 10,
              }}
            >
              <span style={{ fontWeight: 980, fontSize: isBold ? 12 : 11, lineHeight: 1 }}>0</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ShareCard = React.forwardRef<
  HTMLDivElement,
  {
    mode?: "share" | "shelfie";
    shelf: Shelf;
    coverUrls: string[];
    variant: ShareCardVariant;
    stats: { total: number; tbr: number; reading: number; read: number };
  }
>(({ mode: modeProp, shelf, coverUrls, variant, stats }, ref) => {
  const mode = modeProp ?? "share";
  const width = 1080;
  const height = 1920;

  const cardRadius = 24;
  const isBold = variant === "bold";
  const tokens = getShareCardTokens(variant);

  const titleText = `${shelf.emoji || "📚"} ${shelf.name}`;

  const coverCount = coverUrls.filter(Boolean).length;
  const useTwoByTwo = coverCount <= 4;
  const slotCount = useTwoByTwo ? 4 : 6;

  const slots: Array<string | null> = Array.from({ length: slotCount }, (_, i) => coverUrls[i] || null);

  const CoverTile = ({ src, index }: { src: string | null; index: number }) => {
    const tilt = useTwoByTwo ? 0.22 : 0.35;
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "2 / 3",
          borderRadius: 18,
          overflow: "hidden",
          position: "relative",
          border: tokens.tileBorder,
          boxShadow: tokens.tileShadow,
          background:
            "radial-gradient(700px 500px at 15% 15%, rgba(255,73,240,0.22), rgba(255,73,240,0) 55%), radial-gradient(700px 500px at 85% 20%, rgba(109,94,252,0.26), rgba(109,94,252,0) 60%), linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0)), #0f0f14",
          transform: isBold ? "none" : index % 2 === 0 ? `rotate(-${tilt}deg)` : `rotate(${tilt}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 10,
            padding: 16,
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 28, lineHeight: 1 }}>📖</div>
          <div style={{ fontSize: 14, fontWeight: 950, color: "rgba(255,255,255,0.92)" }}>No cover</div>
          <div style={{ fontSize: 12, fontWeight: 850, color: "rgba(255,255,255,0.55)" }}>
            Add more books to fill the grid
          </div>
        </div>

        <CoverImg
          src={src || ""}
          alt="Book cover"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: tokens.tileFilter,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 35%, rgba(0,0,0,0.20) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>
    );
  };

  return (
    <div
      ref={ref}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: cardRadius,
        overflow: "hidden",
        background: tokens.cardBg,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "82px 72px",
        boxSizing: "border-box",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow: tokens.cardShadow,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, marginBottom: 34, textAlign: "center" }}>
        <div
          style={{
            fontSize: tokens.titleSize,
            fontWeight: 980,
            color: "#fff",
            lineHeight: 1.02,
            letterSpacing: isBold ? -0.9 : -0.6,
            textShadow: tokens.titleShadow,
            padding: "0 10px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as any,
            overflow: "hidden",
          }}
        >
          {titleText}
        </div>
      </div>

      <div style={{ position: "relative", flex: 1, zIndex: 2, display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: "100%",
            maxWidth: useTwoByTwo ? 720 : 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: useTwoByTwo ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, auto)",
            gap: useTwoByTwo ? 18 : 16,
            justifyContent: "center",
          }}
        >
          {slots.map((src, i) => (
            <CoverTile key={`${src || "placeholder"}-${i}`} src={src} index={i} />
          ))}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 28,
          marginBottom: 22,
        }}
      >
        {(
          [
            { label: "Total", value: stats.total, glow: "rgba(255,255,255,0.10)" },
            { label: "TBR", value: stats.tbr, glow: "rgba(109,94,252,0.18)" },
            { label: "Reading", value: stats.reading, glow: "rgba(255,226,163,0.16)" },
            { label: "Read", value: stats.read, glow: "rgba(191,247,239,0.14)" },
          ] as const
        ).map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 999,
              background: tokens.pillBg,
              border: tokens.pillBorder,
              boxShadow: `0 14px 40px ${s.glow}`,
            }}
          >
            <div style={{ fontSize: tokens.statNumberSize, fontWeight: 980, color: "#fff", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: tokens.statLabelSize, color: "rgba(255,255,255,0.80)", fontWeight: 900 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 14,
          color: "rgba(255,255,255,0.35)",
          fontWeight: 850,
          letterSpacing: 0.8,
        }}
      >
        {mode === "share" ? <div style={{ opacity: isBold ? 0.55 : 0.45, fontWeight: 900 }}>#BookTok #TBR</div> : <div />}
        <div style={{ opacity: 0.7, fontWeight: 950 }}>{mode === "shelfie" ? "ShelfieEase" : "ShelfieEase · Share"}</div>
      </div>
    </div>
  );
});

ShareCard.displayName = "ShareCard";

function Cover({
  isbn13,
  coverUrl,
  title,
  authors,
  onBadCover,
  updatedAt,
}: {
  isbn13: string;
  coverUrl: string;
  title: string;
  authors: string[];
  onBadCover?: () => void;
  updatedAt?: number;
}) {
  const candidates = [coverUrl ? toHttps(coverUrl) : ""].filter(Boolean);
  const src = candidates[0] || "";

  return (
    <div style={coverWrap}>
      {src && (
        <CoverImg
          key={`cover-img-${coverUrl}-${updatedAt || 0}`}
          src={src}
          alt={title}
          style={coverImg}
          onError={() => onBadCover?.()}
        />
      )}
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
  border: "1px solid var(--border)",
  boxShadow: `0 16px 50px var(--shadow)`,
  marginBottom: 16,
  overflow: "visible",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 14,
  flexWrap: "wrap",
  background: "var(--panel)",
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
  color: "var(--text)",
  lineHeight: 1,
};

const statLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--muted)",
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
  justifyContent: "flex-end",
  flexWrap: "wrap",
  rowGap: 10,
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 16,
  border: 0,
  background: "var(--btnPrimaryBg)",
  color: "var(--btnPrimaryText)",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: `0 12px 28px var(--shadow)`,
  height: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 16,
  border: "1px solid var(--btnGhostBorder)",
  background: "var(--btnGhostBg)",
  color: "var(--text)",
  fontWeight: 900,
  cursor: "pointer",
  height: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
};

const shelfSelector: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 16,
  border: "1px solid var(--btnGhostBorder)",
  background: "var(--btnGhostBg)",
  color: "var(--text)",
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
  maxWidth: "90vw",
  maxHeight: "70vh",
  overflowY: "auto",
  background: "var(--panelSolid)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 6,
  zIndex: 9999,
  boxShadow: `0 16px 50px var(--shadow)`,
};

const dropdownItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  padding: "8px 12px",
  borderRadius: 12,
  border: 0,
  background: "transparent",
  color: "var(--text)",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
  textAlign: "left",
  minHeight: 36,
};

const dropdownItemActive: React.CSSProperties = {
  background: "var(--accentSoft)",
  color: "var(--muted)",
};

const dropdownDivider: React.CSSProperties = {
  height: 1,
  background: "var(--border)",
  margin: "6px 0",
};

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  padding: 16,
};

const modal: React.CSSProperties = {
  background: "var(--panelSolid)",
  border: "1px solid var(--border)",
  borderRadius: 22,
  padding: 20,
  maxWidth: 340,
  width: "100%",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: `0 20px 60px var(--shadow)`,
};

const modalTitle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: 24,
  fontWeight: 950,
  color: "var(--text)",
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
  width: "100%",
  boxSizing: "border-box",
  WebkitAppearance: "none",
  appearance: "none",
};

const formHint: React.CSSProperties = {
  fontSize: 12,
  color: "#8f8fa3",
  textAlign: "right",
};

const emojiPicker: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 4,
};

const emojiChip: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: "1px solid #2a2a32",
  background: "#101014",
  color: "#fff",
  fontSize: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  transition: "all 150ms ease",
};

const emojiChipActive: React.CSSProperties = {
  background: "rgba(109,94,252,0.25)",
  borderColor: "#6d5efc",
  borderWidth: "2px",
  transform: "scale(1.05)",
  boxShadow: "0 0 16px rgba(109,94,252,0.4), 0 4px 12px rgba(109,94,252,0.2)",
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
  zIndex: 100, // Higher than cover image (z-index 10)
  backdropFilter: "blur(8px)",
};

const actionButtonCompact: React.CSSProperties = {
  position: "absolute",
  top: 6,
  right: 6,
  width: 28,
  height: 28,
  borderRadius: 6,
  border: "1px solid #2a2a32",
  background: "rgba(21, 21, 28, 0.7)",
  color: "#fff",
  fontSize: 16,
  fontWeight: 900,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100, // Higher than cover image (z-index 10)
  backdropFilter: "blur(8px)",
  opacity: 0.85,
};

const actionMenu: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  maxHeight: "70vh",
  overflowY: "auto",
  background: "#15151c",
  borderTop: "1px solid #2a2a32",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: "12px 16px 20px",
  zIndex: 1000,
  boxShadow: "0 -8px 32px rgba(0,0,0,0.8)",
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
  padding: "6px 12px 4px",
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
  minHeight: 44,
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

const actionMenuOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  zIndex: 999,
};

const actionMenuHandle: React.CSSProperties = {
  width: 40,
  height: 4,
  background: "#4a4a5a",
  borderRadius: 2,
  margin: "0 auto 12px",
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
  position: "relative",
  zIndex: 1,
};

const card: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 10,
  boxShadow: `0 14px 34px var(--shadow)`,
  animation: "popIn 420ms ease both",
};

const cardCompact: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 7.5, // ~25% reduction from 10px
  boxShadow: `0 8px 20px var(--shadow)`, // Softer shadow
  animation: "popIn 420ms ease both",
};

const coverWrap: React.CSSProperties = {
  position: "relative",
  width: "100%",
  borderRadius: 14,
  overflow: "hidden",
  border: "1px solid var(--border)",
  background: "var(--panel2)",
  aspectRatio: "2 / 3",
};

const coverWrapCompact: React.CSSProperties = {
  position: "relative",
  width: "100%",
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid var(--border)",
  background: "var(--panel2)",
  height: 120, // Fixed height 110-130px range
  aspectRatio: "2 / 3",
};

const coverImg: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 10, // Higher z-index to ensure visibility
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 1, // Always visible
  display: "block",
};

const coverPlaceholder: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  display: "grid",
  alignContent: "center",
  gap: 2,
  padding: 12,
  textAlign: "left",
  background: "var(--panel2)",
};

const coverPlaceholderCompact: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  display: "grid",
  alignContent: "center",
  gap: 2,
  padding: 10,
  textAlign: "left",
  background: "var(--panel2)",
};

const title: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 950,
  lineHeight: 1.2,
};

const titleCompact: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 950,
  lineHeight: 1.3,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const author: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted)",
  fontWeight: 700,
};

const authorCompact: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted)",
  fontWeight: 700,
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
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
  color: "var(--muted)",
};

function badgeFor(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
  fontSize: 12,
    fontWeight: 950,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid var(--border)",
  };

  // Check if we're in Calm mood
  const isCalm = typeof document !== "undefined" && document.documentElement.dataset.mood === "calm";
  
  if (status === "Finished") {
    if (isCalm) {
      return { ...base, background: `color-mix(in srgb, var(--accent1) 14%, transparent)`, color: "var(--text)" };
    }
    return { ...base, background: "rgba(79, 209, 197, 0.18)", color: "#bff7ef" };
  }
  if (status === "Reading") {
    if (isCalm) {
      return { ...base, background: `color-mix(in srgb, var(--accent1) 12%, transparent)`, color: "var(--text)" };
    }
    return { ...base, background: "rgba(255, 203, 76, 0.16)", color: "#ffe2a3" };
  }
  if (isCalm) {
    return { ...base, background: `color-mix(in srgb, var(--accent1) 14%, transparent)`, color: "var(--text)" };
  }
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
