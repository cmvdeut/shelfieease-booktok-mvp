export type BookStatus = "TBR" | "Reading" | "Finished";
export type BookFormat = "physical" | "ebook";

export type Mood = "aesthetic" | "bold" | "calm";

/**
 * Normalize book status to one of the three valid statuses.
 * Maps "Read" and variants to "Finished".
 * Returns "TBR" as default for undefined/null/invalid values.
 * 
 * This ensures consistent counting across the app (stats, library, etc.)
 */
export function normalizeStatus(status: unknown): BookStatus {
  if (status === "TBR" || status === "Reading" || status === "Finished") {
    return status;
  }
  // Map "Read" and variants to "Finished"
  if (status === "Read" || status === "read" || status === "FINISHED") {
    return "Finished";
  }
  // Default to TBR for undefined/null/invalid
  return "TBR";
}

export type Shelf = {
  id: string;
  name: string;
  emoji: string;
  mood?: Mood;
  createdAt: number;
};

export type Book = {
  id: string;
  isbn13: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  status?: BookStatus;
  format?: BookFormat;
  shelfId: string;

  addedAt: number;
  updatedAt: number;
};

const KEY_BOOKS = "shelfieease_books_v1";
const KEY_SHELVES = "shelfieease_shelves_v1";
const KEY_ACTIVE_SHELF = "shelfieease_active_shelf_v1";

function normalizeShelfEmoji(input: unknown): string {
  const e = typeof input === "string" ? input.trim() : "";
  return e ? e : "📚";
}

// Shelf functions
export function loadShelves(): Shelf[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY_SHELVES) || "[]") as unknown;
    if (!Array.isArray(raw)) return [];

    let changed = false;
    const shelves: Shelf[] = [];

    for (const item of raw) {
      const s = item as Partial<Shelf> | null | undefined;
      if (!s || typeof s !== "object") continue;
      if (typeof s.id !== "string" || typeof s.name !== "string" || typeof s.createdAt !== "number") continue;

      const nextEmoji = normalizeShelfEmoji((s as any).emoji);
      if (s.emoji !== nextEmoji) changed = true;

      // Backward compatibility: if shelf has no mood, add "aesthetic" and mark as changed
      const currentMood = s.mood;
      let nextMood: Mood = currentMood === "aesthetic" || currentMood === "bold" || currentMood === "calm" ? currentMood : "aesthetic";
      if (currentMood !== nextMood) changed = true;

      shelves.push({
        id: s.id,
        name: s.name,
        emoji: nextEmoji,
        mood: nextMood,
        createdAt: s.createdAt,
      });
    }

    if (changed) saveShelves(shelves);
    return shelves;
  } catch {
    return [];
  }
}

export function saveShelves(shelves: Shelf[]) {
  localStorage.setItem(KEY_SHELVES, JSON.stringify(shelves));
}

export function getActiveShelfId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY_ACTIVE_SHELF);
}

export function setActiveShelfId(shelfId: string) {
  localStorage.setItem(KEY_ACTIVE_SHELF, shelfId);
}

/**
 * Find a shelf by name (case-insensitive)
 */
function findShelfByNameInternal(shelves: Shelf[], name: string): Shelf | undefined {
  const normalized = name.trim().toLowerCase();
  return shelves.find((s) => s.name.trim().toLowerCase() === normalized);
}

/**
 * Ensure default shelves exist: "My Shelf" (📚) and "Wanna Haves" (🛍️)
 * Only creates missing shelves, doesn't modify existing ones.
 * Doesn't change active shelf.
 */
export function ensureDefaultShelves(): Shelf[] {
  const shelves = loadShelves();
  const defaultShelves = [
    { name: "My Shelf", emoji: "📚" },
    { name: "Wanna Haves", emoji: "🛍️" },
  ];

  let changed = false;
  const updatedShelves = [...shelves];

  for (const defaultShelf of defaultShelves) {
    // Check if shelf with this name already exists
    const existingShelf = findShelfByNameInternal(updatedShelves, defaultShelf.name);
    if (!existingShelf) {
      const newShelf: Shelf = {
        id: crypto.randomUUID(),
        name: defaultShelf.name,
        emoji: defaultShelf.emoji,
        mood: "aesthetic",
        createdAt: Date.now(),
      };
      updatedShelves.push(newShelf);
      changed = true;
    } else {
      // Ensure existing shelf has mood (backward compatibility)
      if (!existingShelf.mood) {
        const idx = updatedShelves.findIndex((s) => s.id === existingShelf.id);
        if (idx >= 0) {
          updatedShelves[idx] = { ...updatedShelves[idx], mood: "aesthetic" };
          changed = true;
        }
      }
    }
  }

  if (changed) {
    saveShelves(updatedShelves);
  }

  // Ensure active shelf is set (but don't change it if it's already valid)
  const activeId = getActiveShelfId();
  if (!activeId || !updatedShelves.find((s) => s.id === activeId)) {
    // Only set active shelf if it's invalid or missing
    const firstShelf = findShelfByNameInternal(updatedShelves, "My Shelf") || updatedShelves[0];
    if (firstShelf) {
      setActiveShelfId(firstShelf.id);
    }
  }

  return updatedShelves;
}

/**
 * @deprecated Use ensureDefaultShelves() instead
 * Kept for backward compatibility
 */
export function ensureDefaultShelf(): Shelf {
  const shelves = ensureDefaultShelves();
  const activeId = getActiveShelfId();
  const shelf = shelves.find((s) => s.id === activeId) || findShelfByNameInternal(shelves, "My Shelf") || shelves[0];
  // Ensure default shelf has mood "aesthetic"
  if (shelf && !shelf.mood) {
    const updatedShelf = { ...shelf, mood: "aesthetic" as Mood };
    const updatedShelves = shelves.map((s) => (s.id === updatedShelf.id ? updatedShelf : s));
    saveShelves(updatedShelves);
    return updatedShelf;
  }
  return shelf;
}

/**
 * Find shelf by name (case-insensitive) - exported for use in components
 */
export function findShelfByName(shelves: Shelf[], name: string): Shelf | undefined {
  const normalized = name.trim().toLowerCase();
  return shelves.find((s) => s.name.trim().toLowerCase() === normalized);
}

export function createShelf(name: string, emoji: string = "📚", mood?: Mood): Shelf {
  const emojiValue = normalizeShelfEmoji(emoji);
  const safeName = name.trim() || "My Shelf";
  const shelfMood: Mood = mood === "aesthetic" || mood === "bold" || mood === "calm" ? mood : "aesthetic";
  const shelf: Shelf = {
    id: crypto.randomUUID(),
    name: safeName,
    emoji: emojiValue,
    mood: shelfMood,
    createdAt: Date.now(),
  };
  const shelves = loadShelves();
  saveShelves([...shelves, shelf]);
  setActiveShelfId(shelf.id);
  return shelf;
}

// Book functions
export function loadBooks(): Book[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY_BOOKS) || "[]") as unknown;
    if (!Array.isArray(raw)) return [];

    const now = Date.now();
    const activeShelfId = getActiveShelfId();
    ensureDefaultShelves(); // Ensure default shelves exist
    const defaultShelfId = activeShelfId || ensureDefaultShelf().id;

    // Use centralized normalizeStatus helper
    const mapStatus = (s: unknown): BookStatus | undefined => {
      const normalized = normalizeStatus(s);
      // Return undefined only if original was undefined/null, otherwise return normalized
      if (s === undefined || s === null) return undefined;
      return normalized;
    };

    const isRecord = (v: unknown): v is Record<string, unknown> =>
      Boolean(v) && typeof v === "object" && !Array.isArray(v);

    const cleaned: Book[] = [];
    let changed = false;

    for (const item of raw) {
      if (!isRecord(item)) {
        changed = true;
        continue;
      }

      const rawId = item.id;
      const rawIsbn13 = item.isbn13;
      const rawIsbn = (item as any).isbn;

      const isbn13 =
        typeof rawIsbn13 === "string" && rawIsbn13.trim()
          ? rawIsbn13.trim()
          : typeof rawIsbn === "string" && rawIsbn.trim()
            ? rawIsbn.trim()
            : "";

      if (!isbn13) {
        // Skip invalid items (no isbn13)
        changed = true;
        continue;
      }

      const id =
        typeof rawId === "string" && rawId.trim() ? rawId : crypto.randomUUID();
      if (id !== rawId) changed = true;

      const title = typeof item.title === "string" ? item.title : "";
      if (title !== item.title) changed = true;

      const authors = Array.isArray(item.authors)
        ? (item.authors as unknown[]).filter((a): a is string => typeof a === "string")
        : [];
      if (!Array.isArray(item.authors)) changed = true;

      const coverUrl = typeof item.coverUrl === "string" ? item.coverUrl : undefined;
      if (typeof item.coverUrl !== "string" && typeof item.coverUrl !== "undefined") changed = true;

      const status = mapStatus(item.status);
      if (status !== item.status) {
        // Also covers the required Read->Finished mapping
        if (typeof item.status !== "undefined") changed = true;
      }

      const format = item.format === "ebook" || item.format === "physical" ? item.format : "physical";
      if (format !== item.format) {
        if (typeof item.format !== "undefined") changed = true;
      }

      const shelfId =
        typeof item.shelfId === "string" && item.shelfId.trim()
          ? item.shelfId
          : defaultShelfId;
      if (shelfId !== item.shelfId) changed = true;

      const addedAt =
        typeof item.addedAt === "number" && Number.isFinite(item.addedAt) ? item.addedAt : now;
      if (addedAt !== item.addedAt) changed = true;

      const updatedAt =
        typeof item.updatedAt === "number" && Number.isFinite(item.updatedAt) ? item.updatedAt : now;
      if (updatedAt !== item.updatedAt) changed = true;

      cleaned.push({
        id,
        isbn13,
        title,
        authors,
        coverUrl,
        status, // only TBR | Reading | Finished (never "Read")
        format, // "physical" | "ebook", default "physical"
        shelfId,
        addedAt,
        updatedAt,
      });
    }

    if (changed) saveBooks(cleaned);
    return cleaned;
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]) {
  localStorage.setItem(KEY_BOOKS, JSON.stringify(books));
}

export function upsertBook(book: Book) {
  const books = loadBooks();
  const idx = books.findIndex((b) => b.isbn13 === book.isbn13 && b.shelfId === book.shelfId);
  const next = [...books];

  const now = Date.now();

  if (idx >= 0) {
    const existing = next[idx];
    const incomingCover = book.coverUrl;
    const coverUrl =
      incomingCover === "" || typeof incomingCover === "undefined" ? existing.coverUrl : incomingCover;

    next[idx] = {
      ...existing,
      ...book,
      coverUrl,
      // Preserve addedAt if it exists; always bump updatedAt.
      addedAt:
        typeof existing.addedAt === "number" && Number.isFinite(existing.addedAt) ? existing.addedAt : now,
      updatedAt: now,
    };
  } else {
    next.unshift({
      ...book,
      id: book.id && book.id.trim() ? book.id : crypto.randomUUID(),
      status: book.status || "TBR",
      addedAt: typeof book.addedAt === "number" && Number.isFinite(book.addedAt) ? book.addedAt : now,
      updatedAt: now,
    });
  }

  saveBooks(next);
  return next;
}

export function updateBook(bookId: string, updates: Partial<Book>) {
  const books = loadBooks();
  const idx = books.findIndex((b) => b.id === bookId);
  if (idx < 0) return books;
  
  const next = [...books];
  next[idx] = { ...next[idx], ...updates, updatedAt: Date.now() };
  saveBooks(next);
  return next;
}

export function deleteBook(bookId: string) {
  const books = loadBooks();
  const next = books.filter((b) => b.id !== bookId);
  saveBooks(next);
  return next;
}
