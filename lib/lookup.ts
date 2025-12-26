export type LookupResult = {
  title: string;
  authors: string[];
  coverUrl: string; // may be "" -> UI shows placeholder
};

type GoogleBooksVolume = {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
  };
};

type GoogleBooksResponse = {
  items?: GoogleBooksVolume[];
};

function forceHttps(url: string) {
  if (!url) return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function boostGoogleThumb(url: string) {
  // Google thumbs often include zoom=1; zoom=2 looks better.
  if (!url) return "";
  let u = url;
  u = forceHttps(u);
  if (u.includes("zoom=1")) u = u.replace("zoom=1", "zoom=2");
  // Remove edge=curl if present (adds visual curl effect we don't want)
  u = u.replace("&edge=curl", "");
  return u;
}

/**
 * Extract the best available cover URL from a Google Books volume.
 * Prefers larger images when available.
 * Returns empty string if no imageLinks available (shows UI placeholder instead).
 */
function extractCoverFromVolume(item: GoogleBooksVolume): string {
  const links = item.volumeInfo?.imageLinks;
  if (!links) return "";

  // Prefer larger formats, fall back to smaller
  const candidates = [
    links.medium,
    links.small,
    links.thumbnail,
    links.smallThumbnail,
  ].filter(Boolean);

  if (candidates.length > 0) {
    return boostGoogleThumb(candidates[0] as string);
  }

  return "";
}

/**
 * Convert ISBN-13 to ISBN-10 (only works for 978- prefixed ISBNs)
 */
function isbn13to10(isbn13: string): string | null {
  const clean = isbn13.replace(/[^0-9]/g, "");
  if (clean.length !== 13 || !clean.startsWith("978")) return null;

  // Take digits 4-12 (the core 9 digits)
  const core = clean.slice(3, 12);

  // Calculate ISBN-10 check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(core[i], 10) * (10 - i);
  }
  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? "0" : remainder === 1 ? "X" : String(11 - remainder);

  return core + checkDigit;
}

/**
 * Try Google Books API with a specific ISBN, returns items or empty array
 */
async function searchGoogleBooks(isbn: string): Promise<GoogleBooksVolume[]> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(
        isbn
      )}&maxResults=5`
    );
    const json = (await res.json()) as GoogleBooksResponse;
    return json.items || [];
  } catch {
    return [];
  }
}

/**
 * Try to get cover from Open Library API.
 * Returns cover URL if found, empty string otherwise.
 * Open Library format: https://covers.openlibrary.org/b/isbn/{ISBN}-{size}.jpg
 * Sizes: S (small), M (medium), L (large)
 */
async function tryOpenLibraryCover(isbn: string): Promise<string> {
  if (!isbn) return "";
  
  // Try large size first for best quality
  const url = `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg`;
  
  try {
    // Check if the image exists by making a HEAD request
    const res = await fetch(url, { method: "HEAD" });
    
    // Open Library returns 200 even for placeholders, but we can check Content-Type
    // If it's an image, use it. Open Library placeholders are also images, but
    // that's okay - better than nothing.
    if (res.ok && res.headers.get("content-type")?.startsWith("image/")) {
      return url;
    }
  } catch {
    // Ignore errors, return empty string
  }
  
  return "";
}

export async function lookupByIsbn(isbn13: string): Promise<LookupResult> {
  const clean = (isbn13 || "").replace(/[^0-9X]/gi, "").trim();

  // Default return
  let title = "";
  let authors: string[] = [];
  let coverUrl = "";

  // --- 1) Google Books metadata + best-effort cover ---
  // Try ISBN-13 first, then ISBN-10 fallback
  let items: GoogleBooksVolume[] = [];

  // First try: ISBN-13 (or whatever was passed)
  items = await searchGoogleBooks(clean);

  // Second try: ISBN-10 if ISBN-13 gave no results
  if (items.length === 0) {
    const isbn10 = isbn13to10(clean);
    if (isbn10) {
      items = await searchGoogleBooks(isbn10);
    }
  }

  // Process results
  try {
    // First pass: get metadata from first item
    if (items.length > 0) {
      const firstInfo = items[0].volumeInfo;
      title = firstInfo?.title || "";
      authors = firstInfo?.authors || [];
    }

    // Second pass: find best cover from any of the results
    for (const item of items.slice(0, 5)) {
      const candidateCover = extractCoverFromVolume(item);
      if (candidateCover) {
        coverUrl = candidateCover;
        
        // If this item also has better metadata, use it
        const info = item.volumeInfo;
        if (!title && info?.title) title = info.title;
        if (authors.length === 0 && info?.authors?.length) {
          authors = info.authors;
        }
        
        break; // Found a cover, stop looking
      }
    }
  } catch {
    // ignore errors, return what we have
  }

  // --- 2) Open Library fallback if Google Books didn't provide a cover ---
  if (!coverUrl) {
    // Try with ISBN-13 first
    coverUrl = await tryOpenLibraryCover(clean);
    
    // If that didn't work and we have an ISBN-10, try that
    if (!coverUrl) {
      const isbn10 = isbn13to10(clean);
      if (isbn10) {
        coverUrl = await tryOpenLibraryCover(isbn10);
      }
    }
  }

  return { title, authors, coverUrl };
}
