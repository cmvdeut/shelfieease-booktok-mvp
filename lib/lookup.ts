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

/**
 * Normalize Google Books cover URL to ensure it's a proper frontcover.
 * Converts content URLs to canonical form with correct parameters.
 * 
 * IMPORTANT: Always uses zoom=1 for content URLs to avoid strip images.
 * Never uses zoom=2 as it can result in invalid covers (e.g., 300x48 strips).
 */
function normalizeGoogleCoverUrl(url: string): string {
  if (!url) return "";

  // Force https
  url = url.replace(/^http:\/\//i, "https://");

  // If it's a Google Books content URL, normalize to canonical form
  // Canonical form:
  // https://books.google.com/books/content?id=VOLUMEID&printsec=frontcover&img=1&zoom=1&source=gbs_api
  if (url.includes("books.google.com/books/content")) {
    try {
      const u = new URL(url);
      const id = u.searchParams.get("id") || "";
      if (!id) return url;

      // Rebuild clean canonical URL with required params
      // ALWAYS use zoom=1 (never zoom=2) to avoid strip images
      const canonical = new URL("https://books.google.com/books/content");
      canonical.searchParams.set("id", id);
      canonical.searchParams.set("printsec", "frontcover");
      canonical.searchParams.set("img", "1");
      canonical.searchParams.set("zoom", "1"); // Force zoom=1, never zoom=2
      canonical.searchParams.set("source", "gbs_api");
      return canonical.toString();
    } catch {
      // If URL parsing fails, return original (but with https)
      return url;
    }
  }

  // If it's a googleusercontent thumbnail or other GB thumb, keep it but force https
  return url;
}

/**
 * Extract the best available cover URL from a Google Books volume.
 * Uses thumbnail or smallThumbnail and normalizes it.
 * Returns empty string if no imageLinks available (shows UI placeholder instead).
 */
function extractCoverFromVolume(item: GoogleBooksVolume): string {
  const links = item.volumeInfo?.imageLinks;
  if (!links) return "";

  // Use thumbnail or smallThumbnail (prefer thumbnail)
  const thumbnailUrl = links.thumbnail || links.smallThumbnail;
  if (!thumbnailUrl) return "";

  // Normalize the URL to ensure it's a proper frontcover
  return normalizeGoogleCoverUrl(thumbnailUrl);
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
 * Explicitly requests imageLinks to ensure they're not filtered out
 */
async function searchGoogleBooks(isbn: string): Promise<GoogleBooksVolume[]> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(
        isbn
      )}&maxResults=1&fields=items(id,volumeInfo(title,authors,imageLinks,industryIdentifiers))`
    );
    const json = (await res.json()) as GoogleBooksResponse;
    return json.items || [];
  } catch {
    return [];
  }
}

type OpenLibrarySearchDoc = {
  cover_i?: number;
  edition_key?: string[];
  [key: string]: unknown;
};

type OpenLibrarySearchResponse = {
  docs?: OpenLibrarySearchDoc[];
  [key: string]: unknown;
};

type OpenLibraryBookData = {
  cover?: {
    large?: string;
    medium?: string;
    small?: string;
  };
  [key: string]: unknown;
};

type OpenLibraryBooksResponse = {
  [key: string]: OpenLibraryBookData;
};

/**
 * Get cover from Open Library via search.json API (prevents 404 spam).
 * Uses search.json?isbn= to find cover_i, then builds cover URL.
 * Returns cover URL if found, "none" otherwise.
 */
async function openLibraryCoverByIsbn(isbn: string): Promise<string | "none"> {
  if (!isbn) return "none";
  
  try {
    const url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return "none";
    const json = await res.json();
    const coverId = json?.docs?.[0]?.cover_i;
    if (!coverId) return "none";
    return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`;
  } catch {
    return "none";
  }
}

/**
 * Try to get cover from Open Library Books API using OLID (edition_key).
 * Returns cover URL if found, empty string otherwise.
 */
async function openLibraryCoverByOlid(olid: string): Promise<string> {
  if (!olid) return "";
  
  try {
    const apiUrl = `https://openlibrary.org/api/books?bibkeys=OLID:${encodeURIComponent(olid)}&format=json&jscmd=data`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return "";
    }
    
    const data = (await response.json()) as OpenLibraryBooksResponse;
    const bookKey = `OLID:${olid}`;
    const bookData = data[bookKey];
    
    // Check if we have cover data (prefer large, fallback to medium)
    if (bookData?.cover?.large) {
      return bookData.cover.large;
    }
    if (bookData?.cover?.medium) {
      return bookData.cover.medium;
    }
    
    return "";
  } catch {
    // If fetch fails, return empty string
    return "";
  }
}

/**
 * Try to get cover from Open Library Search API.
 * Uses the search.json endpoint to find cover_i or edition_key, then builds cover URL.
 * Returns cover URL if found, empty string otherwise.
 * 
 * Fallback order:
 * 1. cover_i -> b/id/{cover_i}-L.jpg
 * 2. edition_key[0] -> api/books -> cover.large/medium
 */
async function openLibraryCoverBySearch(isbn13: string): Promise<string> {
  if (!isbn13) return "";
  
  try {
    const searchUrl = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn13)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      return "";
    }
    
    const data = (await response.json()) as OpenLibrarySearchResponse;
    
    if (!data.docs?.length) {
      return "";
    }
    
    const firstDoc = data.docs[0];
    
    // Step 1: Try cover_i first (faster, direct URL)
    if (firstDoc.cover_i) {
      const cover_i = firstDoc.cover_i;
      // Build cover URL using cover_i (large size)
      return `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg?default=false`;
    }
    
    // Step 2: If no cover_i, try edition_key -> api/books
    if (firstDoc.edition_key && firstDoc.edition_key.length > 0) {
      const olid = firstDoc.edition_key[0];
      const coverUrl = await openLibraryCoverByOlid(olid);
      if (coverUrl) {
        return coverUrl;
      }
    }
    
    return "";
  } catch {
    // If fetch fails, return empty string
    return "";
  }
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
    const item = items?.[0];
    if (item) {
      const volumeId = item.id; // belangrijk
      const vi = item.volumeInfo;

      // Get metadata
      title = vi?.title || "";
      authors = vi?.authors || [];

      // Build coverUrl:
      // 1) Probeer imageLinks eerst (als aanwezig)
      const thumb = vi?.imageLinks?.thumbnail || vi?.imageLinks?.smallThumbnail || "";

      // 2) Als thumb leeg is, gebruik canonical content URL via volumeId
      const canonicalById = volumeId
        ? `https://books.google.com/books/content?id=${encodeURIComponent(volumeId)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
        : "";

      // 3) coverUrl prioriteit:
      // - als thumb bestaat: normalizeGoogleCoverUrl(thumb)
      // - anders: canonicalById
      coverUrl = thumb ? normalizeGoogleCoverUrl(thumb) : canonicalById;
    }
  } catch {
    // ignore errors, return what we have
  }

  // --- 2) Open Library fallback if Google Books didn't provide a cover ---
  if (!coverUrl) {
    // Try Open Library via search.json (prevents 404 spam)
    const ol13 = await openLibraryCoverByIsbn(clean);
    if (ol13 !== "none") {
      coverUrl = ol13;
    } else {
      // If ISBN-13 didn't work, try ISBN-10
      const isbn10 = isbn13to10(clean);
      if (isbn10) {
        const ol10 = await openLibraryCoverByIsbn(isbn10);
        if (ol10 !== "none") {
          coverUrl = ol10;
        }
      }
    }
  }

  return { title, authors, coverUrl };
}
