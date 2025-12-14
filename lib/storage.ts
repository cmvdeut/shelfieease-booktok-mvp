export type BookStatus = "TBR" | "Reading" | "Finished";

export type Shelf = {
  id: string;
  name: string;
  emoji: string;
  createdAt: number;
};

export type Book = {
  id: string;
  isbn13: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  status?: BookStatus;
  shelfId: string;

  addedAt: number;
  updatedAt: number;
};

const KEY_BOOKS = "shelfieease_books_v1";
const KEY_SHELVES = "shelfieease_shelves_v1";
const KEY_ACTIVE_SHELF = "shelfieease_active_shelf_v1";

// Shelf functions
export function loadShelves(): Shelf[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY_SHELVES) || "[]");
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

export function ensureDefaultShelf(): Shelf {
  const shelves = loadShelves();
  if (shelves.length === 0) {
    const defaultShelf: Shelf = {
      id: crypto.randomUUID(),
      name: "My Shelf",
      emoji: "📚",
      createdAt: Date.now(),
    };
    saveShelves([defaultShelf]);
    setActiveShelfId(defaultShelf.id);
    return defaultShelf;
  }
  
  // Ensure active shelf is set
  const activeId = getActiveShelfId();
  if (!activeId || !shelves.find((s) => s.id === activeId)) {
    setActiveShelfId(shelves[0].id);
  }
  
  return shelves.find((s) => s.id === getActiveShelfId()) || shelves[0];
}

export function createShelf(name: string, emoji: string = "📚"): Shelf {
  const shelf: Shelf = {
    id: crypto.randomUUID(),
    name: name.trim(),
    emoji: emoji || "📚",
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
    return JSON.parse(localStorage.getItem(KEY_BOOKS) || "[]");
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

  if (idx >= 0) next[idx] = { ...next[idx], ...book, updatedAt: Date.now() };
  else next.unshift(book);

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
