import type { Book } from "./storage";

function toHttps(url: string): string {
  if (!url || typeof url !== "string") return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

/**
 * Returns the best cover URL for sharing (card/PDF).
 * Uses stored coverUrl if present, otherwise Open Library ISBN fallback.
 * Open Library: https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg?default=false
 */
export function getCoverUrlForShare(book: Book | null | undefined): string {
  if (!book || typeof book !== "object") return "";

  const url = book.coverUrl ? toHttps(String(book.coverUrl).trim()) : "";
  if (url) return url;

  const isbn = String(book.isbn13 ?? "").replace(/[^0-9X]/gi, "").trim();
  if (isbn.length >= 10) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
  }
  return "";
}
