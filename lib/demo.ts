import { ensureDefaultShelves, findShelfByName, saveBooks, type Book } from "@/lib/storage";

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

export function seedDemoBooks(): void {
  try {
    const raw = localStorage.getItem("shelfieease_books_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return;
    }

    const shelves = ensureDefaultShelves();
    const myShelf = findShelfByName(shelves, "My Shelf");
    const wannaHaves = findShelfByName(shelves, "Wanna Haves");

    const fallbackShelfId = shelves[0]?.id ?? crypto.randomUUID();
    const myShelfId = myShelf?.id ?? fallbackShelfId;
    const wannaHavesId = wannaHaves?.id ?? myShelfId;

    const now = Date.now();
    const demoBooks: Book[] = [
      {
        id: crypto.randomUUID(),
        isbn13: "9781649374042",
        title: "Fourth Wing",
        authors: ["Rebecca Yarros"],
        coverUrl: "https://covers.openlibrary.org/b/isbn/9781649374042-L.jpg",
        status: "TBR",
        format: "physical",
        shelfId: wannaHavesId,
        addedAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        isbn13: "9780525559474",
        title: "The Midnight Library",
        authors: ["Matt Haig"],
        coverUrl: "https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg",
        status: "Finished",
        format: "physical",
        shelfId: myShelfId,
        addedAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        isbn13: "9781501110368",
        title: "It Ends with Us",
        authors: ["Colleen Hoover"],
        coverUrl: "https://covers.openlibrary.org/b/isbn/9781501110368-L.jpg",
        status: "Reading",
        format: "physical",
        shelfId: myShelfId,
        addedAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        isbn13: "9781619634459",
        title: "A Court of Thorns and Roses",
        authors: ["Sarah J. Maas"],
        coverUrl: "https://covers.openlibrary.org/b/isbn/9781619634459-L.jpg",
        status: "TBR",
        format: "physical",
        shelfId: wannaHavesId,
        addedAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        isbn13: "9780063021426",
        title: "Babel",
        authors: ["R. F. Kuang"],
        coverUrl: "https://covers.openlibrary.org/b/isbn/9780063021426-L.jpg",
        status: "Reading",
        format: "physical",
        shelfId: myShelfId,
        addedAt: now,
        updatedAt: now,
      },
    ];

    saveBooks(demoBooks);
  } catch {
    // Swallow errors to keep first-load UX non-blocking.
  }
}

