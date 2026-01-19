export function isProUser(): boolean {
  try {
    return localStorage.getItem("se:pro") === "1";
  } catch {
    return false;
  }
}

export function getBookCount(): number {
  try {
    // Use the same key as storage.ts
    const raw = localStorage.getItem("shelfieease_books_v1");
    if (!raw) return 0;
    const books = JSON.parse(raw);
    return Array.isArray(books) ? books.length : 0;
  } catch {
    return 0;
  }
}

export function canAddBook(): boolean {
  // Pro users can always add books (no limit)
  if (isProUser()) return true;
  // Demo users can add up to 10 books
  // IMPORTANT: Existing books are never removed, even if they exceed the limit
  return getBookCount() < 10;
}

const DEMO_LIMIT = 10;

export function demoRemaining(): number {
  if (isProUser()) return Infinity;
  return Math.max(0, DEMO_LIMIT - getBookCount());
}

export function markAsPro() {
  localStorage.setItem("se:pro", "1");
}

