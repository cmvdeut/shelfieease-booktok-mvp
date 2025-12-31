const DEMO_LIMIT = 10;

export function isProUser(): boolean {
  try {
    return localStorage.getItem("se:isPro") === "true";
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
  if (isProUser()) return true;
  return getBookCount() < DEMO_LIMIT;
}

export function demoRemaining(): number {
  if (isProUser()) return Infinity;
  return Math.max(0, DEMO_LIMIT - getBookCount());
}

export function markAsPro() {
  localStorage.setItem("se:isPro", "true");
}

