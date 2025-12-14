export type BookStatus = "TBR" | "Reading" | "Finished";

export type Book = {
  id: string;
  isbn13: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  status?: BookStatus;

  addedAt: number;
  updatedAt: number;
};

const KEY = "shelfieease_books_v1";

export function loadBooks(): Book[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]) {
  localStorage.setItem(KEY, JSON.stringify(books));
}

export function upsertBook(book: Book) {
  const books = loadBooks();
  const idx = books.findIndex((b) => b.isbn13 === book.isbn13);
  const next = [...books];

  if (idx >= 0) next[idx] = { ...next[idx], ...book, updatedAt: Date.now() };
  else next.unshift(book);

  saveBooks(next);
  return next;
}
