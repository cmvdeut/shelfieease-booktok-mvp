import { normalizeSynopsis } from "@/lib/synopsis";

export type LookupResult = {
  title: string;
  authors: string[];
  coverUrl: string; // may be "" -> UI shows placeholder
  synopsis?: string;
};

/**
 * Check if a cover URL is a known "bad cover" placeholder.
 * Returns true if the URL should be rejected (treated as no cover).
 */
export function isBadCoverUrl(url?: string | null): boolean {
  if (!url) return true;
  const u = url.toLowerCase();

  // Google "no cover" placeholders / transparant gif / etc.
  if (u.includes("books.google.com") && u.includes("image") && u.includes("not") && u.includes("available")) return true;

  // Sommige varianten:
  if (u.includes("image_not_available")) return true;

  // Open Library: default=false geeft 404 als er geen cover is — die laten we al checken,
  // maar als er tóch iets als 1x1 terugkomt kan dit ook nog afgevangen worden via CoverImg (zie opdracht 2).
  return false;
}

type GoogleBooksVolume = {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    industryIdentifiers?: { type?: string; identifier?: string }[];
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for potential future use
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
 * Try Google Books API, returns items or empty array.
 * Explicitly requests imageLinks to ensure they're not filtered out.
 * mode "isbn" uses q=isbn:… ; "raw" uses the bare query (helps when isbn: misses NL editions).
 */
async function searchGoogleBooks(
  query: string,
  mode: "isbn" | "raw" = "isbn"
): Promise<GoogleBooksVolume[]> {
  try {
    const key = typeof process !== "undefined" ? (process.env.GOOGLE_BOOKS_API_KEY || "") : "";
    // Without an API key Google Books often returns daily quota 0 / 429 — skip to save time
    if (!key) return [];
    const keyParam = `&key=${encodeURIComponent(key)}`;
    const q = mode === "isbn" ? `isbn:${query}` : query;
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        q
      )}&maxResults=5&fields=items(id,volumeInfo(title,authors,imageLinks,industryIdentifiers))${keyParam}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as GoogleBooksResponse & { error?: unknown };
    if (json.error) return [];
    return json.items || [];
  } catch {
    return [];
  }
}

/** Prefer a Google volume whose industryIdentifiers match the ISBN we scanned. */
function pickGoogleVolumeForIsbn(
  items: GoogleBooksVolume[],
  isbn: string
): GoogleBooksVolume | undefined {
  if (!items.length) return undefined;
  const needle = isbn.replace(/[^0-9X]/gi, "").toUpperCase();
  const match = items.find((item) => {
    const ids = item.volumeInfo?.industryIdentifiers;
    if (!Array.isArray(ids)) return false;
    return ids.some((id) => {
      const cleaned = (id.identifier || "").replace(/[^0-9X]/gi, "").toUpperCase();
      return cleaned === needle;
    });
  });
  return match || items[0];
}

/**
 * Search Google Books API by title and/or author
 * Returns array of book results
 */
export async function searchBooksByTitleOrAuthor(query: string, maxResults: number = 10): Promise<LookupResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const searchQuery = query.trim();
    const key = typeof process !== "undefined" ? (process.env.GOOGLE_BOOKS_API_KEY || "") : "";
    const keyParam = key ? `&key=${encodeURIComponent(key)}` : "";
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        searchQuery
      )}&maxResults=${maxResults}&fields=items(id,volumeInfo(title,authors,imageLinks,industryIdentifiers))${keyParam}`
    );
    const json = (await res.json()) as GoogleBooksResponse;
    const items = json.items || [];
    
    // Convert to LookupResult format
    return items.map((item) => {
      const vi = item.volumeInfo;
      const title = vi?.title || "";
      const authors = vi?.authors || [];
      
      // Get cover URL
      const thumb = vi?.imageLinks?.thumbnail || vi?.imageLinks?.smallThumbnail || "";
      const volumeId = item.id;
      const canonicalById = volumeId
        ? `https://books.google.com/books/content?id=${encodeURIComponent(volumeId)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
        : "";
      
      let coverUrl = thumb ? normalizeGoogleCoverUrl(thumb) : canonicalById;
      if (isBadCoverUrl(coverUrl)) coverUrl = "";
      
      return { title, authors, coverUrl };
    }).filter((result) => result.title.trim() !== ""); // Filter out empty results
  } catch {
    return [];
  }
}

type OpenLibrarySearchDoc = {
  title?: string;
  author_name?: string[];
  cover_i?: number;
  edition_key?: string[];
  ia?: string[];
  lending_identifier_s?: string;
  [key: string]: unknown;
};

type OpenLibrarySearchResponse = {
  docs?: OpenLibrarySearchDoc[];
  [key: string]: unknown;
};

type OpenLibraryBookData = {
  title?: string;
  authors?: { name?: string; url?: string }[];
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

type OpenLibraryIsbnJson = {
  title?: string;
  authors?: { key?: string }[];
  covers?: number[];
  works?: { key?: string }[];
  [key: string]: unknown;
};

function emptyLookup(): LookupResult {
  return { title: "", authors: [], coverUrl: "", synopsis: "" };
}

/**
 * Open Library Books API by ISBN — often finds editions that search.json misses.
 */
async function openLibraryBooksApiByIsbn(isbn: string): Promise<LookupResult> {
  if (!isbn) return emptyLookup();

  try {
    const apiUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(
      isbn
    )}&format=json&jscmd=data`;
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) return emptyLookup();

    const data = (await res.json()) as OpenLibraryBooksResponse;
    const bookData = data[`ISBN:${isbn}`];
    if (!bookData) return emptyLookup();

    const title = typeof bookData.title === "string" ? bookData.title.trim() : "";
    const authors = Array.isArray(bookData.authors)
      ? bookData.authors
          .map((a) => (typeof a?.name === "string" ? a.name.trim() : ""))
          .filter(Boolean)
      : [];

    let coverUrl = bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small || "";
    if (coverUrl && !coverUrl.includes("default=false") && coverUrl.includes("covers.openlibrary.org")) {
      coverUrl += (coverUrl.includes("?") ? "&" : "?") + "default=false";
    }
    if (isBadCoverUrl(coverUrl)) coverUrl = "";

    return { title, authors, coverUrl };
  } catch {
    return emptyLookup();
  }
}

/**
 * Direct edition record: /isbn/{isbn}.json (+ author names via /authors/{id}.json).
 */
async function openLibraryIsbnJsonByIsbn(isbn: string): Promise<LookupResult> {
  if (!isbn) return emptyLookup();

  try {
    const res = await fetch(`https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`, {
      cache: "no-store",
    });
    if (!res.ok) return emptyLookup();

    const edition = (await res.json()) as OpenLibraryIsbnJson;
    const title = typeof edition.title === "string" ? edition.title.trim() : "";

    const authors: string[] = [];
    if (Array.isArray(edition.authors)) {
      for (const ref of edition.authors.slice(0, 5)) {
        const key = ref?.key;
        if (!key) continue;
        try {
          const aRes = await fetch(`https://openlibrary.org${key}.json`, { cache: "no-store" });
          if (!aRes.ok) continue;
          const aJson = (await aRes.json()) as { name?: string };
          if (typeof aJson.name === "string" && aJson.name.trim()) {
            authors.push(aJson.name.trim());
          }
        } catch {
          // ignore single author fetch failures
        }
      }
    }

    let coverUrl = "";
    if (Array.isArray(edition.covers) && edition.covers[0]) {
      coverUrl = `https://covers.openlibrary.org/b/id/${edition.covers[0]}-L.jpg?default=false`;
    }
    if (isBadCoverUrl(coverUrl)) coverUrl = "";

    return { title, authors, coverUrl };
  } catch {
    return emptyLookup();
  }
}

function archiveCoverUrl(iaId: string): string {
  const id = iaId.trim();
  if (!id) return "";
  const absolute = `https://archive.org/services/img/${encodeURIComponent(id)}`;
  return `/api/cover?url=${encodeURIComponent(absolute)}`;
}

function coverFromOpenLibraryDoc(doc: OpenLibrarySearchDoc): string {
  if (doc.cover_i) {
    return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`;
  }
  const ia =
    (Array.isArray(doc.ia) && typeof doc.ia[0] === "string" && doc.ia[0]) ||
    (typeof doc.lending_identifier_s === "string" ? doc.lending_identifier_s : "");
  if (ia) return archiveCoverUrl(ia);
  return "";
}

/**
 * Fetch title, authors, and cover from Open Library search.json by ISBN.
 */
async function openLibraryMetadataByIsbn(isbn: string): Promise<LookupResult> {
  if (!isbn) return emptyLookup();

  try {
    const url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn)}&limit=1`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return emptyLookup();

    const json = (await res.json()) as OpenLibrarySearchResponse;
    const doc = json?.docs?.[0];
    if (!doc) return emptyLookup();

    const title = typeof doc.title === "string" ? doc.title.trim() : "";
    const authors = Array.isArray(doc.author_name)
      ? doc.author_name.filter((a): a is string => typeof a === "string" && a.trim() !== "")
      : [];

    let coverUrl = coverFromOpenLibraryDoc(doc);
    if (isBadCoverUrl(coverUrl)) coverUrl = "";

    return { title, authors, coverUrl };
  } catch {
    return emptyLookup();
  }
}

/** Merge OL/Google metadata into current result; fill only missing fields. */
function mergeLookup(into: LookupResult, from: LookupResult): LookupResult {
  return {
    title: into.title.trim() || from.title.trim(),
    authors: into.authors.length > 0 ? into.authors : from.authors,
    coverUrl: into.coverUrl || from.coverUrl,
    synopsis: (into.synopsis || "").trim() || (from.synopsis || "").trim(),
  };
}

/**
 * Prefer front-cover (_VRK) resource filenames from EasyCB ONIX dump.
 */
function pickEasyCbCoverFile(text: string): string {
  const links: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const idx = line.indexOf("ResourceLink:");
    if (idx < 0) continue;
    const file = line.slice(idx + "ResourceLink:".length).trim();
    if (/\.jpe?g$/i.test(file) && !file.includes("/") && !file.includes("\\")) {
      links.push(file);
    }
  }
  return links.find((f) => /_VRK\.jpe?g$/i.test(f)) || links[0] || "";
}

/** Some CB titles have JPG covers online even when ResourceLink only lists a PDF. */
async function probeEasyCbCoverFile(isbn: string): Promise<string> {
  const clean = isbn.replace(/[^0-9X]/gi, "");
  if (!clean) return "";
  const candidates = [`${clean}_VRK.jpg`, `${clean}_ATK.jpg`];
  for (const file of candidates) {
    try {
      const res = await fetch(`https://easycbapi.nl/resources/jpg/${encodeURIComponent(file)}`, {
        method: "HEAD",
        cache: "no-store",
        headers: {
          contact: "support@shelfieease.app",
          Accept: "image/jpeg,image/*",
        },
      });
      if (res.ok) return file;
    } catch {
      // try next
    }
  }
  return "";
}

/**
 * Centraal Boekhuis / TitelBank via EasyCB — strong for NL/BE trade titles.
 * Title, author, synopsis; cover via same-origin proxy (hotlinking blocked).
 *
 * Caveat: EasyCB's simplified `title`/`author` sometimes expose the *original*
 * foreign title + translator (ONIX B06) instead of the Dutch edition author.
 * Callers should prefer Google ISBN-matched title/authors when available.
 */
async function easyCbMetadataByIsbn(isbn: string): Promise<LookupResult> {
  if (!isbn) return emptyLookup();

  try {
    const res = await fetch(`https://easycbapi.nl/isbn/${encodeURIComponent(isbn)}`, {
      cache: "no-store",
      headers: {
        contact: "support@shelfieease.app",
        Accept: "text/plain",
      },
    });
    if (!res.ok) return emptyLookup();

    const text = await res.text();
    const fields: Record<string, string> = {};
    const contributorRoles: string[] = [];
    let titleType = "";
    for (const line of text.split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (key && !(key in fields)) fields[key] = value;
      if (key === "DescriptiveDetail.Contributor.ContributorRole" && value) {
        contributorRoles.push(value.toUpperCase());
      }
      if (key === "DescriptiveDetail.TitleDetail.TitleType" && !titleType) {
        titleType = value;
      }
      // Stop at raw ONIX dump; simplified fields are above mutationlog
      if (key === "mutationlog") {
        // keep scanning ONIX below for roles/title type
      }
    }

    let title = (fields.title || "").trim();
    let author = (fields.author || "").trim();

    // TitleType 03 = title of original work (often foreign). Don't trust as edition title.
    if (titleType === "03") {
      title = "";
    }

    // If ONIX only lists translators (B06) and no authors (A01), ignore simplified author.
    const hasAuthorRole = contributorRoles.some((r) => r === "A01" || r.startsWith("A0"));
    const hasTranslatorRole = contributorRoles.some((r) => r === "B06");
    if (hasTranslatorRole && !hasAuthorRole) {
      author = "";
    }

    const authors = author ? [author] : [];
    const synopsis = normalizeSynopsis(fields.synopsis || "");
    let coverFile = pickEasyCbCoverFile(text);
    if (!coverFile) {
      coverFile = await probeEasyCbCoverFile(isbn);
    }
    const coverUrl = coverFile
      ? `/api/cover/cb?file=${encodeURIComponent(coverFile)}`
      : "";

    return { title, authors, coverUrl, synopsis };
  } catch {
    return emptyLookup();
  }
}

/** Google Books volume metadata for an exact ISBN (title/authors/cover). */
async function googleMetadataByIsbn(
  isbn13: string,
  isbn10: string | null
): Promise<LookupResult> {
  let items = await searchGoogleBooks(isbn13, "isbn");
  if (items.length === 0 && isbn10) items = await searchGoogleBooks(isbn10, "isbn");
  // SeniorEase also retries bare query when isbn: misses
  if (items.length === 0) items = await searchGoogleBooks(isbn13, "raw");

  const item =
    pickGoogleVolumeForIsbn(items, isbn13) ||
    (isbn10 ? pickGoogleVolumeForIsbn(items, isbn10) : undefined) ||
    items[0];
  if (!item?.volumeInfo) return emptyLookup();

  // Only trust title/authors from an ISBN-matching volume (or sole result)
  const exact =
    pickGoogleVolumeForIsbn(items, isbn13) ||
    (isbn10 ? pickGoogleVolumeForIsbn(items, isbn10) : undefined);
  const vi = (exact || item).volumeInfo!;
  const links = vi.imageLinks;
  // Prefer larger sizes like SeniorEase CoverFetchDialog
  const thumb =
    links?.large ||
    links?.medium ||
    links?.small ||
    links?.thumbnail ||
    links?.smallThumbnail ||
    "";
  let gCover = thumb ? normalizeGoogleCoverUrl(thumb) : "";
  // Never trust unvalidated canonical Google URLs — often 1×1 / tiny placeholders
  if (gCover && !(await isLikelyRealCover(gCover))) {
    gCover = "";
  }

  return {
    title: exact || items.length === 1 ? (vi.title || "").trim() : "",
    authors: exact || items.length === 1 ? vi.authors || [] : [],
    coverUrl: gCover && !isBadCoverUrl(gCover) ? gCover : "",
    synopsis: "",
  };
}

/**
 * Fill missing title/authors/cover from Open Library (books API → isbn.json → search).
 */
async function enrichFromOpenLibrary(isbn: string, current: LookupResult): Promise<LookupResult> {
  let result = current;
  if (result.title.trim() && result.authors.length > 0 && result.coverUrl) return result;

  const sources = [openLibraryBooksApiByIsbn, openLibraryIsbnJsonByIsbn, openLibraryMetadataByIsbn];
  for (const source of sources) {
    if (result.title.trim() && result.authors.length > 0 && result.coverUrl) break;
    const meta = await source(isbn);
    result = mergeLookup(result, meta);
  }

  return result;
}

/**
 * Get cover from Open Library via search.json API (prevents 404 spam).
 * Uses search.json?isbn= to find cover_i, then builds cover URL.
 * Returns cover URL if found, empty string otherwise.
 * IMPORTANT: Always uses ?default=false to prevent placeholder images.
 */
async function openLibraryCoverByIsbn(isbn: string): Promise<string> {
  if (!isbn) return "";
  
  try {
    const url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn)}&limit=1`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return "";
    const json = (await res.json()) as OpenLibrarySearchResponse;
    const doc = json?.docs?.[0];
    if (!doc) return "";
    const coverUrl = coverFromOpenLibraryDoc(doc);
    return isBadCoverUrl(coverUrl) ? "" : coverUrl;
  } catch {
    return "";
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
 * IMPORTANT: Always uses ?default=false to prevent Open Library placeholder images.
 * 
 * Fallback order:
 * 1. cover_i -> b/id/{cover_i}-L.jpg?default=false
 * 2. edition_key[0] -> api/books -> cover.large/medium
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for potential future use
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
      // Build cover URL using cover_i (large size) - ALWAYS use ?default=false
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

function proxyCoverUrl(absoluteUrl: string): string {
  if (!absoluteUrl) return "";
  if (absoluteUrl.startsWith("/api/cover")) return absoluteUrl;
  return `/api/cover?url=${encodeURIComponent(absoluteUrl)}`;
}

/** Rewrite stored absolute cover URLs to same-origin proxy (safe for UI). */
export function toDisplayCoverUrl(url?: string | null): string {
  const u = (url || "").trim();
  if (!u || isBadCoverUrl(u)) return "";
  if (u.startsWith("/api/cover")) return u;
  if (/^https?:\/\//i.test(u)) return proxyCoverUrl(u);
  return u;
}

/** Reject Google/OL tiny placeholders (~1–12KB) that look like "covers" but aren't. */
async function isLikelyRealCover(url: string): Promise<boolean> {
  if (!url || isBadCoverUrl(url)) return false;
  if (url.startsWith("/api/cover/cb")) return true; // EasyCB JPG probe already validated
  try {
    const absolute = url.startsWith("http")
      ? url
      : url.startsWith("/api/cover?url=")
        ? decodeURIComponent(url.slice("/api/cover?url=".length))
        : "";
    if (!absolute.startsWith("http")) return Boolean(url);
    const res = await fetch(absolute, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      cache: "no-store",
      redirect: "follow",
    });
    if (!res.ok && res.status !== 206) return false;
    const len = Number(
      res.headers.get("content-length") ||
        res.headers.get("content-range")?.split("/")?.[1] ||
        0
    );
    // Known Google shared placeholders are ~1269 / ~9103 bytes
    if (len > 0 && len < 12000) return false;
    const type = (res.headers.get("content-type") || "").toLowerCase();
    if (type && !type.startsWith("image/")) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Google "vid=ISBN…" covers: many ISBNs return a shared tiny placeholder (~9103 bytes).
 * Only accept responses that look like a real cover.
 */
async function googleCoverByIsbnVid(isbn: string): Promise<string> {
  const clean = isbn.replace(/[^0-9X]/gi, "");
  if (clean.length < 10) return "";
  const PLACEHOLDER_MAX = 12000;
  for (const zoom of [0, 2, 3, 4]) {
    const url = `https://books.google.com/books/content?vid=ISBN${clean}&printsec=frontcover&img=1&zoom=${zoom}`;
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store", redirect: "follow" });
      if (!res.ok) continue;
      const len = Number(res.headers.get("content-length") || 0);
      const type = (res.headers.get("content-type") || "").toLowerCase();
      if (!type.startsWith("image/")) continue;
      if (len > PLACEHOLDER_MAX) return proxyCoverUrl(url);
    } catch {
      // try next zoom
    }
  }
  return "";
}

/**
 * Bol.com product search — strong for NL (and many EN titles sold in NL).
 */
async function bolCoverByIsbn(isbn: string): Promise<string> {
  const clean = isbn.replace(/[^0-9X]/gi, "");
  if (clean.length < 10) return "";
  try {
    const res = await fetch(`https://www.bol.com/nl/nl/s/?searchtext=${encodeURIComponent(clean)}`, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ShelfieEase/1.0; +https://www.shelfieease.app)",
        "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
        Accept: "text/html",
      },
    });
    if (!res.ok) return "";
    const html = await res.text();
    const re = /https:\/\/media\.s-bol\.com\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/(\d+)x(\d+)\.jpg/g;
    let best = "";
    let bestW = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const w = Number(m[1]) || 0;
      if (w >= bestW) {
        bestW = w;
        best = m[0];
      }
    }
    if (!best || bestW < 100) return "";
    return proxyCoverUrl(best);
  } catch {
    return "";
  }
}

/** When ISBN sources miss, try Open Library by title + author (other editions). */
async function openLibraryCoverByTitleAuthor(title: string, authors: string[]): Promise<string> {
  const t = title.trim();
  if (t.length < 2) return "";
  const author = (authors[0] || "").trim();
  const q = author ? `${t} ${author}` : t;
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return "";
    const json = (await res.json()) as OpenLibrarySearchResponse;
    const docs = json.docs || [];
    const needle = t.toLowerCase();
    const ranked = [...docs].sort((a, b) => {
      const aTitle = (a.title || "").toLowerCase();
      const bTitle = (b.title || "").toLowerCase();
      const aScore = (aTitle === needle ? 2 : aTitle.includes(needle) ? 1 : 0) + (a.cover_i ? 2 : 0);
      const bScore = (bTitle === needle ? 2 : bTitle.includes(needle) ? 1 : 0) + (b.cover_i ? 2 : 0);
      return bScore - aScore;
    });
    for (const doc of ranked) {
      const cover = coverFromOpenLibraryDoc(doc);
      if (cover && !isBadCoverUrl(cover)) return cover.startsWith("/api/") ? cover : proxyCoverUrl(cover);
    }
    return "";
  } catch {
    return "";
  }
}

/** Google Volumes by title+author — critical when ISBN lookup has no imageLinks. */
async function googleCoverByTitleAuthor(title: string, authors: string[]): Promise<string> {
  const t = title.trim();
  if (t.length < 2) return "";
  const author = (authors[0] || "").trim();
  const q = author ? `intitle:${t} inauthor:${author}` : `intitle:${t}`;
  try {
    const results = await searchBooksByTitleOrAuthor(q, 5);
    const needle = t.toLowerCase();
    const ranked = [...results].sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aScore =
        (aTitle === needle ? 3 : aTitle.includes(needle) ? 1 : 0) + (a.coverUrl ? 2 : 0);
      const bScore =
        (bTitle === needle ? 3 : bTitle.includes(needle) ? 1 : 0) + (b.coverUrl ? 2 : 0);
      return bScore - aScore;
    });
    for (const hit of ranked) {
      if (hit.coverUrl && !isBadCoverUrl(hit.coverUrl)) {
        return hit.coverUrl.startsWith("/api/") ? hit.coverUrl : proxyCoverUrl(hit.coverUrl);
      }
    }
    return "";
  } catch {
    return "";
  }
}

/** Fill cover from every free source we trust, in order. */
async function resolveCoverUrl(
  isbn: string,
  isbn10: string | null,
  title: string,
  authors: string[]
): Promise<string> {
  const tries: Array<() => Promise<string>> = [
    () => openLibraryCoverByIsbn(isbn),
    () => (isbn10 ? openLibraryCoverByIsbn(isbn10) : Promise.resolve("")),
    () => googleCoverByIsbnVid(isbn),
    () => (isbn10 ? googleCoverByIsbnVid(isbn10) : Promise.resolve("")),
    // Google by title before Bol — Bol is often blocked from cloud IPs (Vercel)
    () => googleCoverByTitleAuthor(title, authors),
    () => bolCoverByIsbn(isbn),
    () => openLibraryCoverByTitleAuthor(title, authors),
  ];
  for (const tryFn of tries) {
    const cover = await tryFn();
    if (cover && !isBadCoverUrl(cover)) return cover;
  }
  return "";
}

function finalizeLookup(result: LookupResult): LookupResult {
  let coverUrl = result.coverUrl || "";
  if (isBadCoverUrl(coverUrl)) coverUrl = "";
  // Always same-origin proxy for external images (hotlink / referrer blocks in browsers)
  if (coverUrl && /^https?:\/\//i.test(coverUrl)) {
    coverUrl = proxyCoverUrl(coverUrl);
  }
  return {
    title: result.title,
    authors: result.authors,
    coverUrl,
    synopsis: (result.synopsis || "").trim(),
  };
}

export async function lookupByIsbn(isbn13: string): Promise<LookupResult> {
  const clean = (isbn13 || "").replace(/[^0-9X]/gi, "").trim();
  const isbn10 = isbn13to10(clean);
  const likelyNlBe = /^(97890|97894|979)/.test(clean);

  let result: LookupResult = emptyLookup();

  // SeniorEase-library pattern: Google ISBN first (title/author/cover), then Open Library.
  // EasyCB is useful for NL covers + synopsis but often wrong on title/author
  // (original foreign title + translator).
  const google = await googleMetadataByIsbn(clean, isbn10);
  if (google.title.trim() || google.authors.length > 0 || google.coverUrl) {
    result = mergeLookup(result, google);
  }

  // Open Library books API (same fallback as SeniorEase AddItemDialog)
  if (!result.title.trim() || result.authors.length === 0) {
    result = await enrichFromOpenLibrary(clean, result);
    if ((!result.title.trim() || result.authors.length === 0) && isbn10) {
      result = await enrichFromOpenLibrary(isbn10, result);
    }
  }

  // EasyCB: NL cover + synopsis. Prefer EasyCB JPG over weak Google placeholders.
  if (likelyNlBe || !(result.synopsis || "").trim() || !result.coverUrl) {
    const cb = await easyCbMetadataByIsbn(clean);
    result = {
      title: result.title.trim() || cb.title,
      authors: result.authors.length > 0 ? result.authors : cb.authors,
      coverUrl: likelyNlBe
        ? cb.coverUrl || result.coverUrl
        : result.coverUrl || cb.coverUrl,
      synopsis: (result.synopsis || "").trim() || (cb.synopsis || "").trim(),
    };
  }

  // Cover waterfall when still missing (Google title search, Bol, OL, …)
  if (!result.coverUrl) {
    const cover = await resolveCoverUrl(clean, isbn10, result.title, result.authors);
    if (cover) result = { ...result, coverUrl: cover };
  }

  return finalizeLookup(result);
}
