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
  normalizeStatus,
  type Book,
  type Shelf,
  type BookStatus,
  type BookFormat,
  type Mood,
} from "@/lib/storage";

import { getMood, type Mood as DocumentMood } from "@/components/MoodProvider";

import { lookupByIsbn, isBadCoverUrl, searchBooksByTitleOrAuthor } from "@/lib/lookup";
import { CoverImg } from "@/components/CoverImg";
import { CoverPlaceholder } from "@/components/CoverPlaceholder";
import { toBlob } from "html-to-image";
import { detectUiLang, t, isNlUi, tPay } from "@/lib/i18n";
import { canAddBook, demoRemaining, isProUser } from "@/lib/demo";

function googleSearchUrl(q: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

function googleSummaryUrl(title: string, authors: string, isbn: string, nl: boolean): string {
  const keyword = nl ? "samenvatting" : "summary";
  const extra = nl ? "samenvatting summary" : "summary samenvatting";
  const query = `${title} ${authors} ${isbn} ${extra}`;
  return googleSearchUrl(query);
}

function googleCoverUrl(title: string, authors: string, isbn: string, nl: boolean): string {
  const keyword = nl ? "cover" : "cover";
  const extra = nl ? "boekomslag cover" : "book cover";
  const query = `${title} ${authors} ${isbn} ${extra}`;
  // Open Google Images (tbm=isch)
  return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
}

export default function LibraryPage() {
  const router = useRouter();
  const [lang, setLang] = useState<ReturnType<typeof detectUiLang>>(() => {
    // Default to "en" for SSR to match detectUiLang() which always returns "en"
    // This prevents hydration mismatch
    if (typeof window === "undefined") return "en";
    return detectUiLang();
  });
  const nl = lang === "nl";
  
  const [books, setBooks] = useState<Book[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [activeShelfId, setActiveShelfIdState] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<DocumentMood>(() => {
    if (typeof window !== "undefined") {
      return getMood();
    }
    return "default";
  });
  const [pendingIsbn, setPendingIsbn] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<{ title?: string; authors?: string[]; coverUrl?: string } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [targetShelfId, setTargetShelfId] = useState<string | null>(null);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfEmoji, setNewShelfEmoji] = useState("📚");
  const [showNewShelfInAddModal, setShowNewShelfInAddModal] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthors, setManualAuthors] = useState("");
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [bookSearchResults, setBookSearchResults] = useState<Array<{ title: string; authors: string[]; coverUrl: string }>>([]);
  const [bookSearching, setBookSearching] = useState(false);
  const [manualIsbnInput, setManualIsbnInput] = useState("");

  const showToast = useCallback((message: string, duration: number = 2000) => {
    setToast(message);
    window.setTimeout(() => setToast(null), duration);
  }, []);

  // Check for restore backup toast on mount
  useEffect(() => {
    // Small delay to ensure component is fully mounted and visible
    const timeoutId = setTimeout(() => {
      try {
        const toastFlag = localStorage.getItem("shelfie_toast");
        if (toastFlag === "backup_restored") {
          localStorage.removeItem("shelfie_toast");
          showToast("Backup restored successfully", 3000);
        }
      } catch {
        // Ignore storage errors
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [showToast]);


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
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthors, setEditAuthors] = useState("");
  const [editIsbn, setEditIsbn] = useState("");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareCoverUrls, setShareCoverUrls] = useState<string[]>([]);
  const [shareBookTitles, setShareBookTitles] = useState<string[]>([]);
  const [shareBookAuthors, setShareBookAuthors] = useState<string[][]>([]);
  const [shareBookIsbns, setShareBookIsbns] = useState<string[]>([]);
  const [shareBookCount, setShareBookCount] = useState<1 | 2>(2);
  const [shareMood, setShareMood] = useState<"aesthetic" | "bold" | "calm">("aesthetic");
  const [showShareBookCountModal, setShowShareBookCountModal] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [shareFilename, setShareFilename] = useState("");
  const [shareCaption, setShareCaption] = useState("");
  const [copyImageStatus, setCopyImageStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [copyCaptionStatus, setCopyCaptionStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<{ isbn: string; existingShelf: Shelf | null } | null>(null);
  const [showDemoLimitModal, setShowDemoLimitModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [scope, setScope] = useState<"shelf" | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Set<BookStatus>>(new Set());
  const [sortBy, setSortBy] = useState<"recent" | "title" | "author">("recent");

  // Translations - useMemo to recalculate when lang changes
  const copy = useMemo(() => ({
    myShelf: t({ nl: "Mijn shelf", en: "My Shelf" }, lang),
    total: t({ nl: "Totaal", en: "Total" }, lang),
    tbr: t({ nl: "TBR", en: "TBR" }, lang),
    reading: t({ nl: "Bezig", en: "Reading" }, lang),
    read: t({ nl: "Gelezen", en: "Read" }, lang),
    shareShelfie: t({ nl: "Deel shelfie", en: "Share shelfie" }, lang),
    generating: t({ nl: "Bezig…", en: "Generating…" }, lang),
    scan: t({ nl: "+ Scannen", en: "+ Scan" }, lang),
    noBooksYet: t({ nl: "Nog geen boeken. Tijd om te scannen 📚✨", en: "No books yet. Time to scan 📚✨" }, lang),
    scanFirstBook: t({ nl: "Scan je eerste boek", en: "Scan your first book" }, lang),
    newShelf: t({ nl: "Nieuwe shelf", en: "New shelf" }, lang),
    name: t({ nl: "Naam", en: "Name" }, lang),
    emoji: t({ nl: "Emoji", en: "Emoji" }, lang),
    cancel: t({ nl: "Annuleren", en: "Cancel" }, lang),
    create: t({ nl: "Aanmaken", en: "Create" }, lang),
    deleteBook: t({ nl: "Boek verwijderen", en: "Delete book" }, lang),
    deleteBookQuestion: t({ nl: "Boek verwijderen?", en: "Delete book?" }, lang),
    cannotUndo: t({ nl: "Dit kan niet ongedaan gemaakt worden.", en: "This action cannot be undone." }, lang),
    delete: t({ nl: "Verwijderen", en: "Delete" }, lang),
    moveToShelf: t({ nl: "Verplaats naar shelf", en: "Move to shelf" }, lang),
    changeStatus: t({ nl: "Status wijzigen", en: "Change status" }, lang),
    shareModalTitle: t({ nl: "Deel shelfie", en: "Share shelfie" }, lang),
    shareModalTip: t({ nl: "Tip: Op mobiel krijg je de deel-knop van je telefoon.", en: "Tip: On mobile you'll get the native share sheet." }, lang),
    downloadPng: t({ nl: "Download PNG", en: "Download PNG" }, lang),
    copyImage: t({ nl: "Kopieer afbeelding", en: "Copy image" }, lang),
    copied: t({ nl: "Gekopieerd!", en: "Copied!" }, lang),
    copyFailed: t({ nl: "Kopiëren mislukt", en: "Copy failed" }, lang),
    copyCaption: t({ nl: "Kopieer tekst", en: "Copy caption" }, lang),
    copiedCaption: t({ nl: "Tekst gekopieerd!", en: "Copied caption!" }, lang),
    openTikTok: t({ nl: "Open TikTok (web)", en: "Open TikTok (web)" }, lang),
    openSystemShare: t({ nl: "Open deelmenu", en: "Open system share" }, lang),
    close: t({ nl: "Sluiten", en: "Close" }, lang),
    finished: t({ nl: "Finished", en: "Finished" }, lang),
    addBook: t({ nl: "Boek toevoegen", en: "Add book" }, lang),
    loading: t({ nl: "Bezig met ophalen...", en: "Loading..." }, lang),
    chooseShelf: t({ nl: "Kies een shelf", en: "Choose a shelf" }, lang),
    addToShelf: t({ nl: "Zet in deze shelf", en: "Add to this shelf" }, lang),
    makeShelf: t({ nl: "Maak shelf", en: "Create shelf" }, lang),
    back: t({ nl: "Terug", en: "Back" }, lang),
    noBooksFound: t({ nl: "Geen boeken gevonden", en: "No books found" }, lang),
    checkFilters: t({ nl: "Check je filters of zoekterm.", en: "Check your filters or search term." }, lang),
    thisShelf: t({ nl: "This shelf", en: "This shelf" }, lang),
    allShelves: t({ nl: "All shelves", en: "All shelves" }, lang),
    sortRecent: t({ nl: "Sort: Recent", en: "Sort: Recent" }, lang),
    sortTitle: t({ nl: "Sort: Title A–Z", en: "Sort: Title A–Z" }, lang),
    sortAuthor: t({ nl: "Sort: Author A–Z", en: "Sort: Author A–Z" }, lang),
    summary: t({ nl: "Samenvatting", en: "Summary" }, lang),
    findCover: t({ nl: "Cover zoeken", en: "Find cover" }, lang),
    searchPlaceholder: t({ nl: "Zoek in library op titel, auteur of ISBN", en: "Search library by title, author or ISBN" }, lang),
    sortBooks: t({ nl: "Sorteer boeken", en: "Sort books" }, lang),
    duplicateWarning: t({ nl: "Dit boek bestaat al", en: "This book already exists" }, lang),
    duplicateWarningText: t({ nl: "Dit boek staat al in shelf:", en: "This book is already in shelf:" }, lang),
    addAnyway: t({ nl: "Toch toevoegen", en: "Add anyway" }, lang),
  }), [lang]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const shareCardRef = useRef<HTMLDivElement>(null);
  const handledIsbnRef = useRef<string | null>(null);


  // Handle Stripe return: /library?paid=1
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const paid = url.searchParams.get("paid");

    if (paid === "1") {
      // Mark as pro user
      localStorage.setItem("se:pro", "1");
      
      // IMPORTANT: All existing books from demo version are preserved
      // No books are removed when upgrading to pro
      // The canAddBook() function already handles pro users correctly
      
      // Show success message
      const currentLang = detectUiLang();
      showToast(t({ nl: "✨ Pro versie geactiveerd! Alle boeken blijven behouden.", en: "✨ Pro version activated! All books are preserved." }, currentLang), 4000);

      // URL opschonen zodat refresh niet blijft triggeren
      url.searchParams.delete("paid");
      window.history.replaceState({}, "", url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ""));
      
      // Force re-render to update UI (hide demo limit notices, etc.)
      window.dispatchEvent(new Event("storage"));
    }
  }, [showToast]);

  // Handle showDemoLimit query parameter
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("showDemoLimit") === "true") {
      setShowDemoLimitModal(true);
      router.replace("/library");
    }
  }, [router]);

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
        // Check if book was found: title should not be empty and should have content
        const isUnknown = !data.title || data.title.trim() === "" || (data.authors && data.authors.length === 0 && !data.coverUrl);
        setPendingData({
          title: data.title || "Onbekend",
          authors: data.authors || [],
          coverUrl: "", // Don't fetch cover automatically - user can use "Cover zoeken" button
        });
        // Initialize manual input fields if book not found
        if (isUnknown) {
          setManualTitle("");
          setManualAuthors("");
        } else {
          // Clear manual fields if book was found
          setManualTitle("");
          setManualAuthors("");
        }
      } catch (e) {
        console.error("Failed to lookup ISBN:", e);
        setPendingData({
          title: "Onbekend",
          authors: [],
          coverUrl: "",
        });
        setManualTitle("");
        setManualAuthors("");
      } finally {
        setAddLoading(false);
      }
    })();
  }, [router]);

  // Update lang on client mount to ensure correct language detection
  useEffect(() => {
    setLang(detectUiLang());
  }, []);

  // Listen for mood changes to force re-render and apply CSS variables immediately
  useEffect(() => {
    const handleMoodChange = () => {
      const newMood = getMood();
      setCurrentMood(newMood);
    };
    
    // Listen for custom moodchange event
    window.addEventListener("moodchange", handleMoodChange);
    
    // Also check on mount and periodically (as fallback)
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
  }, [currentMood]);

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
    
    // Also clean up empty or whitespace-only coverUrls
    const cleanEmptyCoverUrl = (b: Book) => {
      if (!b.coverUrl || b.coverUrl.trim() === "") {
        return { ...b, coverUrl: "" };
      }
      return b;
    };
    
    // Fix OpenLibrary URLs -> force default=false (prevents placeholder)
    const fixOpenLibraryUrl = (b: Book) => {
      const url = (b.coverUrl || "").trim();
      if (!url) return b;
      
      // Reject known bad cover URLs
      if (isBadCoverUrl(url)) {
        return { ...b, coverUrl: "" };
      }
      
      // Fix OpenLibrary URLs -> force default=false (prevents placeholder)
      if (url.includes("covers.openlibrary.org") && !url.includes("default=false")) {
        const fixed = url + (url.includes("?") ? "&" : "?") + "default=false";
        return { ...b, coverUrl: fixed };
      }
      return b;
    };
    
    // Check for books in "Wanna Haves" with non-TBR status and correct them
    const wannaHavesShelf = allShelves.find((s) => s.name.trim().toLowerCase() === "wanna haves");
    let hasInvalidWannaHavesStatus = false;
    
    let didStrip = false;
    const cleanedBooks = allBooks.map((b) => {
      let next = stripStaleOpenLibraryCover(b);
      next = cleanEmptyCoverUrl(next);
      next = fixOpenLibraryUrl(next);
      // Check if coverUrl changed (detect any cleanup changes)
      if (next.coverUrl !== b.coverUrl) didStrip = true;
      
      // Validate "Wanna Haves" shelf status
      if (wannaHavesShelf && next.shelfId === wannaHavesShelf.id) {
        const normalizedStatus = normalizeStatus(next.status);
        if (normalizedStatus !== "TBR") {
          hasInvalidWannaHavesStatus = true;
          next = { ...next, status: "TBR" as BookStatus };
        }
      }
      
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
      // Persist cleanup if we changed anything (including Wanna Haves status correction)
      if (didStrip || hasInvalidWannaHavesStatus) saveBooks(cleanedBooks);
      setBooks(cleanedBooks);
      
      // Show warning if Wanna Haves books were corrected
      if (hasInvalidWannaHavesStatus) {
        setTimeout(() => {
          showToast(
            t(
              {
                nl: "Boeken in 'Wanna Haves' zijn automatisch op TBR gezet.",
                en: "Books in 'Wanna Haves' have been automatically set to TBR.",
              },
              lang
            ),
            4000
          );
        }, 500);
      }
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

    // Status filter - use normalizeStatus for consistent filtering
    if (statusFilter.size > 0 && statusFilter.size < 3) {
      filtered = filtered.filter((b) => {
        const status = normalizeStatus(b.status);
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

  // Helper function to compute stats from a book array
  function computeStats(books: Book[]) {
    const tbr = books.filter((b) => normalizeStatus(b.status) === "TBR").length;
    const reading = books.filter((b) => normalizeStatus(b.status) === "Reading").length;
    const read = books.filter((b) => normalizeStatus(b.status) === "Finished").length;
    return { total: books.length, tbr, reading, read };
  }

  // Calculate stats from visibleBooks (same dataset as what's rendered)
  // This ensures stats always match what the user sees
  const stats = useMemo(() => {
    return computeStats(visibleBooks);
  }, [visibleBooks]);

  // Derive active shelf for header
  const activeShelf = useMemo(() => {
    if (!activeShelfId) return null;
    return shelves.find((s) => s.id === activeShelfId) || null;
  }, [activeShelfId, shelves]);

  // Derive header title based on scope
  const headerTitle = useMemo(() => {
    if (scope === "all") {
      return copy.allShelves;
    }
    return activeShelf ? `${activeShelf.emoji || "📚"} ${activeShelf.name}` : copy.myShelf;
  }, [scope, activeShelf, copy.allShelves, copy.myShelf]);

  // Show Share Shelfie only if total books >= 2 and add modal is not open
  const showShareButton = stats.total >= 2 && !addModalOpen;

  function handleShelfSelect(shelfId: string) {
    setActiveShelfId(shelfId);
    setActiveShelfIdState(shelfId);
    setScope("shelf"); // Switch to "This shelf" mode when selecting a specific shelf
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

    // Check if book already exists
    const allBooks = loadBooks();
    const existingBook = allBooks.find((b) => b.isbn13 === pendingIsbn);
    
    if (existingBook) {
      // Find the shelf where the book already exists
      const existingShelf = shelves.find((s) => s.id === existingBook.shelfId);
      setDuplicateWarning({ isbn: pendingIsbn, existingShelf: existingShelf || null });
      return;
    }

    // No duplicate, proceed with adding
    addBookToShelfInternal();
  }

  function addBookToShelfInternal() {
    if (!pendingIsbn || !targetShelfId) return;

    // Check demo limit before adding book
    if (!canAddBook()) {
      setShowDemoLimitModal(true);
      return;
    }

    const now = Date.now();
    // Check if book was not found and use manual input if available
    const isUnknown = !pendingData?.title || pendingData.title === "Onbekend" || pendingData.title.trim() === "";
    const finalTitle = isUnknown && manualTitle.trim() ? manualTitle.trim() : (pendingData?.title || "Onbekend");
    const finalAuthors = isUnknown && manualAuthors.trim() 
      ? manualAuthors.split(",").map(a => a.trim()).filter(a => a.length > 0)
      : (pendingData?.authors || []);
    
    const book: Book = {
      id: pendingIsbn,
      isbn13: pendingIsbn,
      title: finalTitle,
      authors: finalAuthors,
      coverUrl: pendingData?.coverUrl || "",
      shelfId: targetShelfId,
      status: "TBR" as BookStatus,
      addedAt: now,
      updatedAt: now,
    };

    upsertBook(book);
    handleBookAdded();
    
    // Check remaining books for demo feedback
    const remaining = demoRemaining();
    if (remaining === 1) {
      showToast(t({ nl: "✨ Nog 1 boek over in de demo", en: "✨ 1 book remaining in demo" }, lang), 5000); // 5 seconds
    } else if (remaining === 0) {
      showToast(t({ nl: "🎉 Demo compleet", en: "🎉 Demo complete" }, lang), 5000); // 5 seconds
    }
    
    // Reset state and clean URL
    setAddModalOpen(false);
    setPendingIsbn(null);
    setPendingData(null);
    setTargetShelfId(null);
    setDuplicateWarning(null);
    setManualTitle("");
    setManualAuthors("");
    setBookSearchQuery("");
    setBookSearchResults([]);
    handledIsbnRef.current = null;
    router.replace("/library");
  }

  async function handleBookSearch() {
    if (!bookSearchQuery.trim() || bookSearching) return;
    
    setBookSearching(true);
    setBookSearchResults([]);
    
    try {
      const results = await searchBooksByTitleOrAuthor(bookSearchQuery.trim(), 10);
      setBookSearchResults(results);
    } catch (error) {
      console.error("Error searching books:", error);
      showToast(t({ nl: "Zoeken mislukt", en: "Search failed" }, lang));
    } finally {
      setBookSearching(false);
    }
  }

  function handleCancelAddBook() {
    setAddModalOpen(false);
    setPendingIsbn(null);
    setPendingData(null);
    setTargetShelfId(null);
    setShowNewShelfInAddModal(false);
    setNewShelfName("");
    setNewShelfEmoji("📚");
    setManualTitle("");
    setManualAuthors("");
    setBookSearchQuery("");
    setBookSearchResults([]);
    handledIsbnRef.current = null;
    router.replace("/library");
  }

  function handleManualIsbnSubmit() {
    const normalizedIsbn = manualIsbnInput.replace(/[^0-9X]/gi, "").trim();
    if (!normalizedIsbn) return;

    // Check demo limit before adding book
    if (!canAddBook()) {
      setShowDemoLimitModal(true);
      setManualIsbnInput("");
      return;
    }

    // Navigate to library with addIsbn parameter (same flow as scan page)
    router.push(`/library?addIsbn=${encodeURIComponent(normalizedIsbn)}`);
    setManualIsbnInput("");
  }

  function handleMoveBook(bookId: string, targetShelfId: string) {
    updateBook(bookId, { shelfId: targetShelfId });
    const updated = loadBooks();
    setBooks(updated);
    setActionMenuBookId(null);
  }

  function handleChangeStatus(bookId: string, status: BookStatus) {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    
    // Check if book is in "Wanna Haves" shelf (case-insensitive)
    const bookShelf = shelves.find((s) => s.id === book.shelfId);
    const isWannaHaves = bookShelf && bookShelf.name.trim().toLowerCase() === "wanna haves";
    
    // If book is in "Wanna Haves" and trying to set status other than TBR, show warning
    if (isWannaHaves && status !== "TBR") {
      showToast(
        t(
          {
            nl: "Boeken in 'Wanna Haves' kunnen alleen TBR status hebben.",
            en: "Books in 'Wanna Haves' can only have TBR status.",
          },
          lang
        ),
        3000
      );
      return;
    }
    
    const updated = updateBook(bookId, { status });
    setBooks(updated);
    showToast(t({ nl: `Status bijgewerkt naar ${status === "Finished" ? "Gelezen" : status === "Reading" ? "Bezig" : "TBR"}`, en: `Status updated to ${status === "Finished" ? "Read" : status}` }, lang));
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

  function handleEditBook(bookId: string) {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    
    setEditTitle(book.title || "");
    setEditAuthors(book.authors?.join(", ") || "");
    setEditIsbn(book.isbn13 || "");
    setEditCoverUrl(book.coverUrl || "");
    setEditingBookId(bookId);
    setActionMenuBookId(null);
  }

  function handleSaveBookEdit() {
    if (!editingBookId) return;
    
    const book = books.find((b) => b.id === editingBookId);
    if (!book) return;
    
    const authorsArray = editAuthors.trim()
      ? editAuthors.split(",").map(a => a.trim()).filter(a => a.length > 0)
      : [];
    
    const normalizedIsbn = editIsbn.replace(/[^0-9X]/gi, "").trim().toUpperCase();
    
    updateBook(editingBookId, {
      title: editTitle.trim() || book.title,
      authors: authorsArray.length > 0 ? authorsArray : book.authors,
      isbn13: normalizedIsbn || book.isbn13,
      coverUrl: editCoverUrl.trim() || book.coverUrl || "",
    });
    
    const updated = loadBooks();
    setBooks(updated);
    setEditingBookId(null);
    setEditTitle("");
    setEditAuthors("");
    setEditIsbn("");
    setEditCoverUrl("");
    showToast(t({ nl: "Boek bijgewerkt", en: "Book updated" }, lang));
  }

  // Removed handleSearchCover - users should use "Find cover" button instead

  async function handleShareShelf() {
    // Allow sharing for both "All shelves" and specific shelf
    if (scope === "shelf" && !activeShelf) return;
    
    // Show modal to choose 1 or 2 books
    setShowShareBookCountModal(true);
  }

  async function goToCheckout() {
    // Idempotent: als gebruiker al PRO is, sluit modal
    if (isProUser()) {
      setShowDemoLimitModal(false);
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          origin: window.location.origin,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.url) {
        throw new Error(data?.message || "Payment setup incomplete. Please contact support.");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      showToast(
        t({ 
          nl: "Payment setup incomplete. Please contact support.", 
          en: "Payment setup incomplete. Please contact support." 
        }, lang),
        5000
      );
      setCheckoutLoading(false);
    }
  }

  async function generateShareCard(bookCount: 1 | 2) {
    if (!shareCardRef.current) {
      showToast(t({ nl: "Kan shelfie niet genereren", en: "Cannot generate shelfie" }, lang));
      return;
    }
    
    // For "This shelf" mode, we need an active shelf
    if (scope === "shelf" && !activeShelf) {
      showToast(t({ nl: "Geen shelf geselecteerd", en: "No shelf selected" }, lang));
      return;
    }

    // Use visibleBooks (same as what's displayed) or fallback to activeBooks
    const availableBooks = visibleBooks.length > 0 ? visibleBooks : activeBooks;
    
    // Guard: check if enough books are available
    if (availableBooks.length < bookCount) {
      showToast(
        t(
          {
            nl: `Niet genoeg boeken. Beschikbaar: ${availableBooks.length}, nodig: ${bookCount}`,
            en: `Not enough books. Available: ${availableBooks.length}, needed: ${bookCount}`,
          },
          lang
        )
      );
      return;
    }

    setSharing(true);
    setShowShareBookCountModal(false);
    try {
      // Capture current mood at generation time
      const currentMood = typeof document !== "undefined" ? (document.documentElement.dataset.mood || "default") : "default";
      const capturedMood: "aesthetic" | "bold" | "calm" = currentMood === "bold" ? "bold" : currentMood === "calm" ? "calm" : "aesthetic";
      setShareMood(capturedMood);
      
      // Use headerTitle to respect scope (all shelves vs this shelf)
      const title = scope === "all" 
        ? copy.allShelves 
        : `${activeShelf.emoji || "📚"} ${activeShelf.name}`;
      const isMobile =
        typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // Use same-origin proxy for covers so the share card image can load (avoids CORS with html-to-image).
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const proxyUrl = (raw: string) =>
        origin ? `${origin}/api/cover?url=${encodeURIComponent(raw)}` : "";

      const picked: string[] = [];
      const pickedTitles: string[] = [];
      const pickedAuthors: string[][] = [];
      const pickedIsbns: string[] = [];
      const seen = new Set<string>();

      for (const b of availableBooks.slice(0, bookCount)) {
        if (picked.length >= bookCount) break;

        const bookTitle = b.title || "Unknown";
        const bookAuthors = b.authors || [];
        const bookIsbn = b.isbn13 || "";
        const coverUrl = b.coverUrl ? toHttps(b.coverUrl) : "";

        if (coverUrl && !seen.has(coverUrl) && origin) {
          seen.add(coverUrl);
          picked.push(proxyUrl(coverUrl));
          pickedTitles.push(bookTitle);
          pickedAuthors.push(bookAuthors);
          pickedIsbns.push(bookIsbn);
        } else {
          picked.push("");
          pickedTitles.push(bookTitle);
          pickedAuthors.push(bookAuthors);
          pickedIsbns.push(bookIsbn);
        }
      }

      // Update the hidden ShareCard contents (covers, titles, authors, and ISBNs) before capture.
      setShareCoverUrls(picked);
      setShareBookTitles(pickedTitles);
      setShareBookAuthors(pickedAuthors);
      setShareBookIsbns(pickedIsbns);
      setShareBookCount(bookCount);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      // Give proxy cover images time to load before capturing
      await new Promise<void>((r) => setTimeout(r, 700));

      const blob = await toBlob(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      if (!blob) {
        showToast(t({ nl: "Fout bij genereren van afbeelding", en: "Error generating image" }, lang));
        return;
      }

      const filename = scope === "all" 
        ? "all-shelves.png"
        : `${activeShelf.name.replace(/\s+/g, "-")}-shelf.png`;
      
      const shelfLabel = scope === "all" 
        ? copy.allShelves.toLowerCase()
        : `${activeShelf.emoji || "📚"} ${activeShelf.name}`;
      
      const caption = nl
        ? `✨ Mijn ${shelfLabel} update!
📚 Totaal: ${stats.total} | TBR: ${stats.tbr} | Bezig: ${stats.reading} | Gelezen: ${stats.read}
Wat moet ik hierna toevoegen? 👀
#BookTok #TBR #ReadingCommunity #Shelfie #Bookish`
        : `✨ My ${shelfLabel} update!
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

  // activeShelf is now defined earlier as useMemo (see line 529)

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
              {scope === "all" ? (
                <>
                  <span style={{ fontSize: 24 }}>📚</span>
                  <span style={{ fontSize: 20, fontWeight: 950 }}>{headerTitle}</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 24 }}>{activeShelf?.emoji || "📚"}</span>
                  <span style={{ fontSize: 20, fontWeight: 950 }}>{activeShelf?.name || copy.myShelf}</span>
                </>
              )}
              <span style={{ fontSize: 12, opacity: 0.7 }}>▼</span>
            </button>

            {showShelfDropdown && (
              <div style={{
                ...dropdown,
                backdropFilter: "blur(16px)",
                background: typeof document !== "undefined" && document.documentElement.dataset.mood === "default"
                  ? "rgba(20, 19, 29, 0.95)"
                  : "var(--panelSolid)",
              }}>
                {shelves.map((shelf) => {
                  const shelfBookCount = books.filter((b) => b.shelfId === shelf.id).length;
                  return (
                    <button
                      key={shelf.id}
                      style={{
                        ...dropdownItem,
                        ...(shelf.id === activeShelfId ? dropdownItemActive : {}),
                      }}
                      onClick={() => handleShelfSelect(shelf.id)}
                    >
                      <span>{shelf.emoji}</span>
                      <span>{shelf.name} ({shelfBookCount})</span>
                      {shelf.id === activeShelfId && <span style={{ fontSize: 10 }}>✓</span>}
                    </button>
                  );
                })}
                <div style={dropdownDivider} />
                <button
                  style={dropdownItem}
                  onClick={() => {
                    setShowShelfDropdown(false);
                    setShowNewShelfModal(true);
                  }}
                >
                  <span>+</span>
                  <span>{copy.newShelf}</span>
                </button>
        </div>
            )}
          </div>

          <div style={shelfStats}>
            <div style={statItem}>
              <span style={statNumber}>{stats.total}</span>
              <span style={statLabel}>{copy.total}</span>
            </div>
            <div style={statItem}>
              <span style={statNumber}>{stats.tbr}</span>
              <span style={statLabel}>{copy.tbr}</span>
            </div>
            <div style={statItem}>
              <span style={statNumber}>{stats.reading}</span>
              <span style={statLabel}>{copy.reading}</span>
            </div>
            <div style={statItem}>
              <span style={statNumber}>{stats.read}</span>
              <span style={statLabel}>{copy.read}</span>
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
          {/* Only show Share Shelfie if total books >= 2 and add modal is not open */}
          {showShareButton && (
            <button
              style={btnGhost}
              onClick={handleShareShelf}
              disabled={sharing || !activeShelf || activeBooks.length === 0}
              aria-label={sharing ? t({ nl: "Bezig met genereren…", en: "Generating share image" }, lang) : copy.shareShelfie}
              title={sharing ? copy.generating : copy.shareShelfie}
            >
              {sharing ? copy.generating : copy.shareShelfie}
            </button>
          )}

          {/* Manual ISBN input */}
          <div style={{ display: "flex", gap: 8, flex: 1, maxWidth: 200 }}>
            <input
              id="manual-isbn-library-input"
              name="manual-isbn-library-input"
              value={manualIsbnInput}
              onChange={(e) => setManualIsbnInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleManualIsbnSubmit();
                }
              }}
              inputMode="numeric"
              placeholder={t({ nl: "ISBN", en: "ISBN" }, lang)}
              aria-label={t({ nl: "ISBN invoeren", en: "Enter ISBN" }, lang)}
              style={{
                flex: 1,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--panel2)",
                padding: "8px 12px",
                fontSize: 14,
                color: "var(--text)",
                minWidth: 0,
              }}
            />
            {manualIsbnInput.trim() && (
              <button
                onClick={handleManualIsbnSubmit}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: "var(--btnPrimaryBg)",
                  color: "var(--btnPrimaryText)",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                type="button"
              >
                {t({ nl: "Zoek", en: "Search" }, lang)}
              </button>
            )}
          </div>

        <Link href="/scan">
          <button style={btnPrimary}>{copy.scan}</button>
        </Link>
        </div>
      </div>

      {/* Hidden Share Card for rendering - show when a shelf is selected OR scope is "all" so Share shelfie always has a ref */}
      {(activeShelf || scope === "all") && (() => {
        // Use captured mood from state, fallback to current mood if not set
        const currentMood = shareMood || (typeof document !== "undefined" ? (document.documentElement.dataset.mood || "default") : "default");
        // Preserve the mood: bold -> bold, calm -> aesthetic (calm style), default/aesthetic -> aesthetic
        const shareVariant: "aesthetic" | "bold" = currentMood === "bold" ? "bold" : "aesthetic";
        const finalMood: "aesthetic" | "bold" | "calm" = currentMood === "calm" ? "calm" : currentMood === "bold" ? "bold" : "aesthetic";
        // Create a virtual shelf for "All shelves" mode; otherwise use selected shelf
        const displayShelf: Shelf = scope === "all"
          ? { id: "all", name: copy.allShelves, emoji: "📚", createdAt: Date.now() }
          : activeShelf ?? { id: "all", name: copy.allShelves, emoji: "📚", createdAt: Date.now() };
        
        return (
          <div style={{ position: "fixed", left: "-10000px", top: 0, opacity: 0, pointerEvents: "none" }}>
            <ShareCard
              ref={shareCardRef}
              mode="shelfie"
              shelf={displayShelf}
              coverUrls={shareCoverUrls}
              bookTitles={shareBookTitles}
              bookAuthors={shareBookAuthors}
              bookIsbns={shareBookIsbns}
              bookCount={shareBookCount}
              variant={shareVariant}
              mood={finalMood}
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
            <h2 style={modalTitle}>{copy.shareModalTitle}</h2>

            <p style={{ margin: "6px 0 12px", color: "var(--muted)", fontWeight: 700 }}>
              {copy.shareModalTip}
            </p>

            <div style={{ display: "grid", gap: 10 }}>
              <button
                style={btnPrimary}
                onClick={() => {
                  if (!shareBlob || !shareFilename) return;
                  downloadImage(shareBlob, shareFilename);
                }}
              >
                {copy.downloadPng}
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
                  ? copy.copied
                  : copyImageStatus === "failed"
                    ? copy.copyFailed
                    : copy.copyImage}
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
                  ? copy.copiedCaption
                  : copyCaptionStatus === "failed"
                    ? t({ nl: "Kopiëren tekst mislukt", en: "Copy caption failed" }, lang)
                    : copy.copyCaption}
              </button>

              <button
                style={btnGhost}
                onClick={() => {
                  const url = "https://www.tiktok.com/upload?lang=en";
                  const w = window.open(url, "_blank", "noopener,noreferrer");
                  if (!w) window.open("https://www.tiktok.com/", "_blank", "noopener,noreferrer");
                }}
              >
                {copy.openTikTok}
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
                {copy.openSystemShare}
              </button>

              <button style={btnGhost} onClick={() => setShareModalOpen(false)}>
                {copy.close}
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
            <h2 style={modalTitle}>{copy.newShelf}</h2>
            <div style={modalForm}>
              <div style={formGroup}>
                <label htmlFor="new-shelf-name" style={formLabel}>{copy.name}</label>
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
                  placeholder={copy.myShelf}
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
                <label htmlFor="new-shelf-emoji" style={formLabel}>{copy.emoji}</label>
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
                  {copy.cancel}
                </button>
                <button style={btnPrimary} onClick={handleCreateShelf} disabled={!name.trim()}>
                  {copy.create}
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
              background: "var(--panelSolid)",
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
              {copy.addBook}
            </h2>

            {addLoading ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)" }}>
                {copy.loading}
                </div>
            ) : (
              <>
                {pendingData && (() => {
                  // Check if book is unknown: title is empty, "Onbekend", or has no authors/cover
                  const isUnknown = !pendingData.title || 
                                   pendingData.title === "Onbekend" || 
                                   pendingData.title.trim() === "" ||
                                   (pendingData.title === "Onbekend" && (!pendingData.authors || pendingData.authors.length === 0));
                  
                  if (isUnknown) {
                    // Show input fields for manual entry when book not found
                    return (
                      <div style={{ marginBottom: 24 }}>
                        {/* Retry scan option */}
                        {pendingIsbn && (
                          <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "var(--panel2)", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                              {t({ nl: "Boek niet gevonden voor ISBN:", en: "Book not found for ISBN:" }, lang)} <span style={{ fontWeight: 600, color: "var(--text)" }}>{pendingIsbn}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                handleCancelAddBook();
                                router.push("/scan");
                              }}
                              style={{
                                ...btnGhost,
                                width: "100%",
                                padding: "10px 16px",
                                fontSize: 14,
                              }}
                            >
                              📷 {t({ nl: "Opnieuw scannen", en: "Scan again" }, lang)}
                            </button>
                          </div>
                        )}

                        {/* Search section */}
                        <div style={{ ...formGroup, marginBottom: 20 }}>
                          <label htmlFor="book-search-query" style={{ ...formLabel, color: "var(--text)" }}>
                            {t({ nl: "Zoek op titel of auteur", en: "Search by title or author" }, lang)}
                          </label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              id="book-search-query"
                              type="text"
                              value={bookSearchQuery}
                              onChange={(e) => setBookSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && bookSearchQuery.trim() && !bookSearching) {
                                  handleBookSearch();
                                }
                              }}
                              placeholder={t({ nl: "Bijv. 'Harry Potter' of 'J.K. Rowling'", en: "E.g. 'Harry Potter' or 'J.K. Rowling'" }, lang)}
                              style={{
                                ...formInput,
                                border: "1px solid var(--border)",
                                background: "var(--panel2)",
                                color: "var(--text)",
                                flex: 1,
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleBookSearch}
                              disabled={!bookSearchQuery.trim() || bookSearching}
                              style={{
                                ...btnPrimary,
                                padding: "12px 20px",
                                whiteSpace: "nowrap",
                                opacity: (!bookSearchQuery.trim() || bookSearching) ? 0.5 : 1,
                                cursor: (!bookSearchQuery.trim() || bookSearching) ? "not-allowed" : "pointer",
                              }}
                            >
                              {bookSearching ? t({ nl: "Zoeken...", en: "Searching..." }, lang) : t({ nl: "Zoek", en: "Search" }, lang)}
                            </button>
                          </div>
                        </div>

                        {/* Search results */}
                        {bookSearchResults.length > 0 && (
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>
                              {t({ nl: "Zoekresultaten", en: "Search results" }, lang)} ({bookSearchResults.length})
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "200px", overflowY: "auto" }}>
                              {bookSearchResults.map((result, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setPendingData({
                                      title: result.title,
                                      authors: result.authors,
                                      coverUrl: result.coverUrl,
                                    });
                                    setManualTitle(result.title);
                                    setManualAuthors(result.authors.join(", "));
                                    setBookSearchResults([]);
                                    setBookSearchQuery("");
                                  }}
                                  style={{
                                    padding: "12px",
                                    borderRadius: 12,
                                    border: "1px solid var(--border)",
                                    background: "var(--panel2)",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--panel)";
                                    e.currentTarget.style.borderColor = "var(--accent1)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "var(--panel2)";
                                    e.currentTarget.style.borderColor = "var(--border)";
                                  }}
                                >
                                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                                    {result.title}
                                  </div>
                                  {result.authors.length > 0 && (
                                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                                      {result.authors.join(", ")}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Manual entry fields */}
                        <div style={{ ...formGroup, marginBottom: 16 }}>
                          <label htmlFor="manual-title" style={{ ...formLabel, color: "var(--text)" }}>
                            {t({ nl: "Titel", en: "Title" }, lang)} *
                          </label>
                          <input
                            id="manual-title"
                            type="text"
                            value={manualTitle}
                            onChange={(e) => setManualTitle(e.target.value)}
                            placeholder={t({ nl: "Voer boek titel in", en: "Enter book title" }, lang)}
                            style={{
                              ...formInput,
                              border: "1px solid var(--border)",
                              background: "var(--panel2)",
                              color: "var(--text)",
                            }}
                            autoFocus={!bookSearchQuery}
                          />
                        </div>
                        <div style={formGroup}>
                          <label htmlFor="manual-authors" style={{ ...formLabel, color: "var(--text)" }}>
                            {t({ nl: "Auteur(s)", en: "Author(s)" }, lang)}
                          </label>
                          <input
                            id="manual-authors"
                            type="text"
                            value={manualAuthors}
                            onChange={(e) => setManualAuthors(e.target.value)}
                            placeholder={t({ nl: "Voer auteur(s) in (gescheiden door komma)", en: "Enter author(s) (separated by comma)" }, lang)}
                            style={{
                              ...formInput,
                              border: "1px solid var(--border)",
                              background: "var(--panel2)",
                              color: "var(--text)",
                            }}
                          />
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                            {t({ nl: "Scheid meerdere auteurs met een komma", en: "Separate multiple authors with a comma" }, lang)}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Show book info when found
                    return (
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
                    );
                  }
                })()}

                {!showNewShelfInAddModal ? (
                  <>
                    <div style={{ ...formGroup, marginBottom: 20 }}>
                      <label htmlFor="add-book-shelf" style={{ ...formLabel, color: "var(--text)" }}>{copy.chooseShelf}</label>
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
                        + {copy.newShelf}
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
                        {copy.cancel}
                      </button>
                      <button
                        style={{
                          ...btnPrimary,
                          flex: 1,
                          justifyContent: "center",
                        }}
                        onClick={handleAddBookToShelf}
                        disabled={!targetShelfId || (pendingData && (!pendingData.title || pendingData.title === "Onbekend" || pendingData.title.trim() === "") && !manualTitle.trim())}
                      >
                        {copy.addToShelf}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={modalForm}>
                    <div style={formGroup}>
                      <label htmlFor="add-book-new-shelf-name" style={{ ...formLabel, color: "var(--text)" }}>{copy.name}</label>
                      <input
                        id="add-book-new-shelf-name"
                        name="add-book-new-shelf-name"
                        type="text"
                        value={newShelfName}
                        onChange={(e) => setNewShelfName(e.target.value.slice(0, 24))}
                        placeholder={copy.myShelf}
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
                      <label htmlFor="add-book-new-shelf-emoji" style={{ ...formLabel, color: "var(--text)" }}>{copy.emoji}</label>
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
                        {copy.makeShelf}
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
                        {copy.back}
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
            <h2 style={modalTitle}>{copy.deleteBookQuestion}</h2>
            <p style={{ color: "var(--muted)", margin: "0 0 24px" }}>{copy.cannotUndo}</p>
            <div style={modalActions}>
              <button style={btnGhost} onClick={() => setShowDeleteConfirm(null)}>
                {copy.cancel}
              </button>
              <button
                style={{ ...btnPrimary, background: "var(--danger)", color: typeof document !== "undefined" && document.documentElement.dataset.mood === "calm" ? "#4A3825" : "#fff" }}
                onClick={() => handleDeleteBook(showDeleteConfirm)}
              >
                {copy.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingBookId && (
        <div style={modalOverlay} onClick={() => setEditingBookId(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>{t({ nl: "Bewerk boek", en: "Edit book" }, lang)}</h2>
            <div style={modalForm}>
              <div style={formGroup}>
                <label htmlFor="edit-title" style={{ ...formLabel, color: "var(--text)" }}>
                  {t({ nl: "Titel", en: "Title" }, lang)} *
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder={t({ nl: "Voer boek titel in", en: "Enter book title" }, lang)}
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
                <label htmlFor="edit-authors" style={{ ...formLabel, color: "var(--text)" }}>
                  {t({ nl: "Auteur(s)", en: "Author(s)" }, lang)}
                </label>
                <input
                  id="edit-authors"
                  type="text"
                  value={editAuthors}
                  onChange={(e) => setEditAuthors(e.target.value)}
                  placeholder={t({ nl: "Voer auteur(s) in (gescheiden door komma)", en: "Enter author(s) (separated by comma)" }, lang)}
                  style={{
                    ...formInput,
                    border: "1px solid var(--border)",
                    background: "var(--panel2)",
                    color: "var(--text)",
                  }}
                />
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  {t({ nl: "Scheid meerdere auteurs met een komma", en: "Separate multiple authors with a comma" }, lang)}
                </div>
              </div>
              <div style={formGroup}>
                <label htmlFor="edit-isbn" style={{ ...formLabel, color: "var(--text)" }}>
                  ISBN
                </label>
                <input
                  id="edit-isbn"
                  type="text"
                  value={editIsbn}
                  onChange={(e) => setEditIsbn(e.target.value)}
                  placeholder={t({ nl: "Bijv. 9789022591260", en: "E.g. 9789022591260" }, lang)}
                  inputMode="numeric"
                  style={{
                    ...formInput,
                    border: "1px solid var(--border)",
                    background: "var(--panel2)",
                    color: "var(--text)",
                  }}
                />
              </div>
              <div style={formGroup}>
                <label htmlFor="edit-cover-url" style={{ ...formLabel, color: "var(--text)" }}>
                  {t({ nl: "Cover URL (optioneel)", en: "Cover URL (optional)" }, lang)}
                </label>
                <input
                  id="edit-cover-url"
                  type="url"
                  value={editCoverUrl}
                  onChange={(e) => setEditCoverUrl(e.target.value)}
                  placeholder={t({ nl: "https://...", en: "https://..." }, lang)}
                  style={{
                    ...formInput,
                    border: "1px solid var(--border)",
                    background: "var(--panel2)",
                    color: "var(--text)",
                  }}
                />
              </div>
            </div>
            <div style={modalActions}>
              <button style={btnGhost} onClick={() => setEditingBookId(null)}>
                {copy.cancel}
              </button>
              <button
                style={btnPrimary}
                onClick={handleSaveBookEdit}
                disabled={!editTitle.trim()}
              >
                {t({ nl: "Opslaan", en: "Save" }, lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {duplicateWarning && (
        <div style={modalOverlay} onClick={() => setDuplicateWarning(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>{copy.duplicateWarning}</h2>
            <p style={{ color: "var(--muted)", margin: "0 0 24px" }}>
              {copy.duplicateWarningText}{" "}
              {duplicateWarning.existingShelf ? (
                <span style={{ fontWeight: 700, color: "var(--text)" }}>
                  {duplicateWarning.existingShelf.emoji} {duplicateWarning.existingShelf.name}
                </span>
              ) : (
                <span style={{ fontWeight: 700, color: "var(--text)" }}>{t({ nl: "Onbekende shelf", en: "Unknown shelf" }, lang)}</span>
              )}
            </p>
            <div style={modalActions}>
              <button style={btnGhost} onClick={() => setDuplicateWarning(null)}>
                {copy.cancel}
              </button>
              <button
                style={btnPrimary}
                onClick={() => {
                  setDuplicateWarning(null);
                  addBookToShelfInternal();
                }}
              >
                {copy.addAnyway}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareBookCountModal && (
        <div style={modalOverlay} onClick={() => setShowShareBookCountModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>{t({ nl: "Kies aantal boeken", en: "Choose number of books" }, lang)}</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.5, marginBottom: 24 }}>
              {t({ nl: "Hoeveel boeken wil je delen?", en: "How many books do you want to share?" }, lang)}
            </p>
            <div style={modalActions}>
              <button
                style={btnPrimary}
                onClick={() => generateShareCard(1)}
                disabled={sharing || visibleBooks.length < 1}
              >
                {t({ nl: "1 boek", en: "1 book" }, lang)}
              </button>
              <button
                style={btnPrimary}
                onClick={() => generateShareCard(2)}
                disabled={sharing || visibleBooks.length < 2}
              >
                {t({ nl: "2 boeken", en: "2 books" }, lang)}
              </button>
              <button style={btnGhost} onClick={() => setShowShareBookCountModal(false)}>
                {copy.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDemoLimitModal && (
        <div style={modalOverlay} onClick={() => setShowDemoLimitModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>{tPay("demoReachedTitle")}</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
              {tPay("demoReachedBody").split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < tPay("demoReachedBody").split("\n").length - 1 && <br />}
                </span>
              ))}
            </p>

            <div style={modalActions}>
              <button
                style={btnPrimary}
                onClick={goToCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading
                  ? t({ nl: "Laden...", en: "Loading..." }, lang)
                  : tPay("unlockCta")}
              </button>

              <button
                style={btnGhost}
                onClick={() => setShowDemoLimitModal(false)}
                disabled={checkoutLoading}
              >
                {tPay("later")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters - Always visible */}
      <div style={{ padding: "0 16px 16px", display: "grid", gap: 12 }}>
          {/* Search input */}
          <div style={{ position: "relative" }}>
            <input
              id="book-search"
              name="book-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
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
                {copy.thisShelf}
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
                {copy.allShelves}
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
                {status === "TBR" ? copy.tbr : status === "Reading" ? copy.reading : copy.finished}
              </button>
            ))}

            {/* Sort dropdown */}
            <select
              id="book-sort"
              name="book-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "title" | "author")}
              aria-label={copy.sortBooks}
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
              <option value="recent">{copy.sortRecent}</option>
              <option value="title">{copy.sortTitle}</option>
              <option value="author">{copy.sortAuthor}</option>
            </select>
          </div>
        </div>

      {/* Books grid or empty state */}
      {visibleBooks.length === 0 ? (
        <div style={emptyCard}>
          {searchQuery.trim().length > 0 ? (
            <>
              <p style={{ color: "var(--muted)", marginTop: 0, fontWeight: 700, marginBottom: 8 }}>
                {copy.noBooksFound}
              </p>
              <p style={{ color: "var(--muted2)", marginTop: 0, fontSize: 14 }}>
                {copy.checkFilters}
              </p>
            </>
          ) : scope === "all" ? (
            <>
              <p style={{ color: "var(--muted)", marginTop: 0, fontWeight: 700, marginBottom: 8 }}>
                {t({ nl: "Nog geen boeken in je library", en: "No books in your library yet" }, lang)}
              </p>
              <p style={{ color: "var(--muted2)", marginTop: 0, fontSize: 14 }}>
                {t({ nl: "Scan een ISBN om je eerste boek toe te voegen.", en: "Scan an ISBN to add your first book." }, lang)}
              </p>
            </>
          ) : (
            <>
              <p style={{ color: "var(--muted)", marginTop: 0, fontWeight: 700, marginBottom: 8 }}>
                {t({ nl: "Nog geen boeken in deze shelf", en: "No books in this shelf yet" }, lang)}
              </p>
              <p style={{ color: "var(--muted2)", marginTop: 0, fontSize: 14 }}>
                {t({ nl: "Scan een ISBN om een boek toe te voegen.", en: "Scan an ISBN to add a book." }, lang)}
              </p>
            </>
          )}
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
                        <div style={actionMenuLabel}>{copy.moveToShelf}</div>
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
                            <span style={{ color: "var(--accent1)" }}>{shelf.name}</span>
                            {shelf.id === b.shelfId && <span style={{ fontSize: 10 }}>✓</span>}
                          </button>
                        ))}
                      </div>

                      <div style={actionMenuDivider} />

                      <div style={actionMenuSection}>
                        <div style={actionMenuLabel}>{copy.changeStatus}</div>
                        {(["TBR", "Reading", "Finished"] as BookStatus[]).map((status) => {
                          // Check if book is in "Wanna Haves" shelf
                          const bookShelf = shelves.find((s) => s.id === b.shelfId);
                          const isWannaHaves = bookShelf && bookShelf.name.trim().toLowerCase() === "wanna haves";
                          const isDisabled = isWannaHaves && status !== "TBR";
                          
                          return (
                            <button
                              key={status}
                              style={{
                                ...actionMenuItem,
                                ...(b.status === status ? actionMenuItemActive : {}),
                                ...(isDisabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
                              }}
                              onClick={() => !isDisabled && handleChangeStatus(b.id, status)}
                              disabled={isDisabled}
                            >
                              <span>{status === "Finished" ? copy.read : status === "Reading" ? copy.reading : copy.tbr}</span>
                              {b.status === status && <span style={{ fontSize: 10 }}>✓</span>}
                              {isDisabled && <span style={{ fontSize: 10, marginLeft: 4 }}>🔒</span>}
                            </button>
                          );
                        })}
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
                        onClick={() => handleEditBook(b.id)}
                      >
                        <span>✏️ {t({ nl: "Bewerk boek", en: "Edit book" }, lang)}</span>
                      </button>

                      <div style={actionMenuDivider} />

                      <button 
                        style={{ ...actionMenuItem, color: "var(--danger)" }} 
                        onClick={() => {
                          setActionMenuBookId(null);
                          setShowDeleteConfirm(b.id);
                        }}
                      >
                        <span>🗑️ {copy.deleteBook}</span>
                      </button>
                    </div>
                  </>
                )}

                {(() => {
                  const nl = isNlUi();
                  const isCalm = typeof document !== "undefined" && document.documentElement.dataset.mood === "calm";
                  
                  const miniLinkBtn: React.CSSProperties = {
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: isCalm 
                      ? "1px solid #D8C6A8"
                      : "1px solid rgba(255,255,255,0.14)",
                    background: isCalm
                      ? "rgba(58, 42, 26, 0.08)"
                      : "rgba(255,255,255,0.06)",
                    color: isCalm
                      ? "#4A3825"
                      : "rgba(255,255,255,0.92)",
                    fontWeight: 850,
                    fontSize: 12,
                    cursor: "pointer",
                  };

                  return (
                    <>
                      {/* cardTop: titel, auteur, ISBN klein */}
                      <div style={cardTop}>
                        <div style={titleStyle}>{b.title}</div>
                        {b.authors?.length ? <div style={authorStyle}>by {b.authors.join(", ")}</div> : null}
                        {scope === "all" && bookShelf && (
                          <div style={{
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
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ ...isbn, fontSize: 10 }}>ISBN {b.isbn13}</span>
                          {(() => {
                            // Use normalizeStatus to ensure consistent display
                            const s = normalizeStatus(b.status);
                            const label = s === "Finished" ? copy.read : s === "Reading" ? copy.reading : copy.tbr;
                            return <span style={badgeFor(s)}>{label}</span>;
                          })()}
                        </div>
              </div>

                      {/* cardActions: Samenvatting / Cover zoeken */}
                      <div style={cardActions}>
                        <button
                          type="button"
                          style={miniLinkBtn}
                          onClick={() => window.open(googleSummaryUrl(b.title, (b.authors || []).join(", "), b.isbn13, nl), "_blank", "noopener,noreferrer")}
                        >
                          {copy.summary}
                        </button>

                        <button
                          type="button"
                          style={miniLinkBtn}
                          onClick={() => {
                            const coverUrl = googleCoverUrl(b.title, (b.authors || []).join(", "), b.isbn13, nl);
                            window.open(coverUrl, "_blank", "noopener,noreferrer");
                          }}
                        >
                          {copy.findCover}
                        </button>
            </div>

                      {/* cardBottom: ebook badge */}
                      <div style={cardBottom}>
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
                      </div>
                    </>
                  );
                })()}
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
            maxWidth: "calc(100vw - 40px)",
            textAlign: "center",
            boxShadow: `0 8px 24px var(--shadow)`,
            opacity: 0.95,
          }}
        >
          {toast}
        </div>
      )}

      {!isProUser() && (
        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 8, textAlign: "center", padding: "16px", color: "var(--muted)", fontWeight: 500 }}>
          {t({ nl: "Demo-versie · max. 10 boeken", en: "Demo version · max. 10 books" }, lang)}
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
          {Array.from({ length: 4 }).map((_, i) => {
            const isCalm = typeof document !== "undefined" && document.documentElement.dataset.mood === "calm";
            return (
              <div
                key={i}
                style={{
                  aspectRatio: "2 / 3",
                  borderRadius: 10,
                  border: tokens.tileBorder,
                  boxShadow: "0 8px 18px rgba(0,0,0,0.45)",
                  background: isCalm ? "#E8D9C3" : "rgba(255,255,255,0.06)",
                }}
              />
            );
          })}
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
    bookTitles?: string[];
    bookAuthors?: string[][];
    bookIsbns?: string[];
    bookCount?: 1 | 2;
    variant: ShareCardVariant;
    mood?: "aesthetic" | "bold" | "calm";
    stats: { total: number; tbr: number; reading: number; read: number };
  }
>(({ mode: modeProp, shelf, coverUrls, bookTitles = [], bookAuthors = [], bookIsbns = [], bookCount = 2, variant, mood = "aesthetic", stats }, ref) => {
  const mode = modeProp ?? "share";
  const width = 1080;
  const height = 1400; // Reduced from 1920 to make cards less tall

  const cardRadius = 24;
  const isBold = variant === "bold";
  const isCalm = mood === "calm";
  const tokens = getShareCardTokens(variant);

  const titleText = `${shelf.emoji || "📚"} ${shelf.name}`;

  // Use bookCount to determine layout: 1 or 2 books
  const slotCount = bookCount;
  const slots: Array<string | null> = Array.from({ length: slotCount }, (_, i) => coverUrls[i] || null);

  const CoverTile = ({ src, index, title, authors, isbn }: { src: string | null; index: number; title?: string; authors?: string[]; isbn?: string }) => {
    const tilt = bookCount === 1 ? 0 : 0.22;
    
    // Use mood-aware background for placeholder tiles
    const tileBackground = isCalm
      ? "linear-gradient(135deg, rgba(156, 107, 47, 0.12), rgba(156, 107, 47, 0.06)), #0f0f14"
      : "radial-gradient(700px 500px at 15% 15%, rgba(255,73,240,0.22), rgba(255,73,240,0) 55%), radial-gradient(700px 500px at 85% 20%, rgba(109,94,252,0.26), rgba(109,94,252,0) 60%), linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0)), #0f0f14";
    
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
          background: tileBackground,
          transform: isBold ? "none" : index % 2 === 0 ? `rotate(-${tilt}deg)` : `rotate(${tilt}deg)`,
        }}
      >
        {src ? (
          <>
            <CoverImg
              src={src}
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
            {title && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "20px 16px 16px",
                  background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.88) 100%)",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 950,
                    color: "#fff",
                    lineHeight: 1.2,
                    textAlign: "center",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical" as any,
                    overflow: "hidden",
                    textShadow: "0 2px 10px rgba(0,0,0,0.9)",
                  }}
                >
                  {title}
                </div>
              </div>
            )}
          </>
        ) : (
          <CoverPlaceholder title={title || "Unknown"} authors={authors} isbn={isbn} mood={mood} />
        )}
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
        padding: "60px 72px",
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

      <div style={{ position: "relative", zIndex: 2, marginBottom: 24, textAlign: "center" }}>
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
            maxWidth: bookCount === 1 ? 500 : 720,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: bookCount === 1 ? "1fr" : "repeat(2, 1fr)",
            gridTemplateRows: "auto",
            gap: bookCount === 1 ? 0 : 18,
            justifyContent: "center",
          }}
        >
          {slots.map((src, i) => (
            <CoverTile key={`${src || ""}-${i}`} src={src} index={i} title={bookTitles[i]} authors={bookAuthors[i]} isbn={bookIsbns[i]} />
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
          marginTop: 20,
          marginBottom: 16,
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

// Normalize cover URL: force HTTPS and ensure Open Library uses ?default=false
function normalizeCoverUrl(url: string): string {
  if (!url) return "";
  if (isBadCoverUrl(url)) return "";
  
  let u = url.startsWith("http://") ? url.replace("http://", "https://") : url;

  // Safety: prevent OpenLibrary placeholder images
  if (u.includes("covers.openlibrary.org") && !u.includes("default=false")) {
    u += (u.includes("?") ? "&" : "?") + "default=false";
  }
  return u;
}


/* ------- styles ------- */

const page: React.CSSProperties = {
  padding: 16,
  maxWidth: 1060,
  margin: "0 auto",
  backgroundColor: "var(--accentSoft2)",
  color: "var(--text)",
};

const hero: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 14,
  flexWrap: "wrap",
  padding: 14,
  borderRadius: 22,
  border: "var(--border)",
  background: "var(--panel)",
  boxShadow: "0 16px 50px var(--shadow)",
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
  boxShadow: "0px 4px 12px 0px rgba(0, 0, 0, 0.15)",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  backgroundImage: "none",
  backgroundClip: "unset",
  WebkitBackgroundClip: "unset",
};

const dropdownItemActive: React.CSSProperties = {
  background: "var(--accentSoft)",
  color: "var(--accent1)",
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
  border: "1px solid var(--border)",
  background: "var(--panel)",
  color: "var(--text)",
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
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "var(--border)",
  background: "var(--panel)",
  color: "var(--text)",
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
  background: "var(--accent1)",
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
  border: "1px solid var(--accent1)",
  background: "var(--accent1)",
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
  background: "var(--panelSolid)",
  borderTop: "1px solid var(--border)",
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
  color: "var(--text)",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
  textAlign: "left",
  minHeight: 44,
};

const actionMenuItemActive: React.CSSProperties = {
  background: "rgba(109,94,252,0.18)",
  color: "var(--accent1)",
};

const actionMenuDivider: React.CSSProperties = {
  height: 1,
  background: "var(--border)",
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
  background: "var(--border)",
  borderRadius: 2,
  margin: "0 auto 12px",
};

const emptyCard: React.CSSProperties = {
  marginTop: 14,
  padding: 16,
  borderRadius: 18,
  border: "1px solid var(--border)",
  background: "var(--panel)",
};

const grid: React.CSSProperties = {
  display: "grid",
  gap: 14,
  marginTop: 14,
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gridAutoRows: "1fr",
  alignItems: "stretch", // All cards stretch to same height
  position: "relative",
  zIndex: 1,
};

const card: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 14,
  boxShadow: `0 14px 34px var(--shadow)`,
  animation: "popIn 420ms ease both",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  height: "100%",
  minHeight: 210,
};

const cardCompact: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 14,
  boxShadow: `0 8px 20px var(--shadow)`,
  animation: "popIn 420ms ease both",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  height: "100%",
  minHeight: 210,
};

const cardTop: React.CSSProperties = {
  flex: "1 1 auto",
  minHeight: 84,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const cardActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const cardBottom: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "auto",
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
  // Subtle pill-style label - not clickable
  // Mood-aware colors (same as stats page)
  const isCalm = typeof document !== "undefined" && document.documentElement.dataset.mood === "calm";
  
  let background = "";
  if (status === "TBR") {
    background = isCalm ? "rgba(140,120,255,0.15)" : "rgba(140,120,255,0.18)";
  } else if (status === "Reading") {
    background = isCalm ? "rgba(80,180,200,0.15)" : "rgba(80,180,200,0.18)";
  } else {
    background = isCalm ? "rgba(120,160,120,0.15)" : "rgba(120,160,120,0.18)";
  }
  
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    marginLeft: 6,
    cursor: "default",
    background,
    color: "var(--text)",
    userSelect: "none",
  };
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
