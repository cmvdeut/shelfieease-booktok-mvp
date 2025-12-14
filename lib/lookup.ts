export type LookupResult = {
  title?: string;
  authors?: string[];
  coverUrl?: string;
};

type OpenLibraryIsbnResponse = {
  title?: unknown;
  authors?: Array<{ key?: unknown }> | unknown;
};

type OpenLibraryAuthorResponse = {
  name?: unknown;
};

type GoogleBooksResponse = {
  items?: Array<{
    id?: unknown;
    volumeInfo?: {
      title?: unknown;
      authors?: unknown;
      imageLinks?: {
        thumbnail?: unknown;
        smallThumbnail?: unknown;
      };
    };
  }>;
};


export async function lookupByIsbn(isbnRaw: string): Promise<LookupResult> {
  const isbn = normalizeIsbn(isbnRaw);

  // 1) Open Library metadata
  const ol = await lookupOpenLibrary(isbn);
  if (ol.title) return ol;

  // 2) Google Books fallback (covers vaak hier)
  const gb = await lookupGoogleBooks(isbn);
  if (gb.title) return gb;

  // 3) Last resort - altijd Open Library cover URL
  return {
    title: undefined,
    authors: [],
    coverUrl: coverFromOpenLibrary(isbn, "M"),
  };
}

function normalizeIsbn(code: string) {
  return (code || "").replace(/[^\dX]/gi, "");
}

function toHttps(url?: string) {
  if (!url) return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function coverFromOpenLibrary(isbn: string, size: "S" | "M" | "L" = "M") {
  // Open Library Covers API - gratis, geen API key nodig, werkt overal
  // Formaten: -S (small), -M (medium), -L (large)
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

function getGoogleBooksThumbnailUrl(thumbnailUrl?: string): string {
  if (!thumbnailUrl) return "";
  
  // Google Books thumbnail URLs hebben vaak http://, converteren naar https://
  const httpsUrl = toHttps(thumbnailUrl);
  
  // Soms bevat de URL parameters die we kunnen aanpassen voor betere kwaliteit
  // Vervang "zoom=1" door "zoom=2" voor hogere resolutie
  if (httpsUrl.includes("zoom=1")) {
    return httpsUrl.replace("zoom=1", "zoom=2");
  }
  
  // Voeg zoom parameter toe als die niet bestaat
  if (httpsUrl.includes("books.google.com") && !httpsUrl.includes("zoom=")) {
    const separator = httpsUrl.includes("?") ? "&" : "?";
    return `${httpsUrl}${separator}zoom=2`;
  }
  
  return httpsUrl;
}

async function lookupOpenLibrary(isbn: string): Promise<LookupResult> {
  try {
    const r = await fetch(`https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`);
    if (!r.ok) return { title: undefined, authors: [], coverUrl: coverFromOpenLibrary(isbn, "M") };

    const data = (await r.json()) as OpenLibraryIsbnResponse;

    const title = isString(data.title) ? data.title : undefined;

    const authorKeys: string[] = Array.isArray(data.authors)
      ? data.authors
          .map((a) => (isString(a?.key) ? a.key : null))
          .filter((x): x is string => Boolean(x))
      : [];

    const authors = await fetchOpenLibraryAuthors(authorKeys);

    return {
      title,
      authors,
      coverUrl: coverFromOpenLibrary(isbn, "M"),
    };
  } catch {
    return { title: undefined, authors: [], coverUrl: coverFromOpenLibrary(isbn, "M") };
  }
}

async function fetchOpenLibraryAuthors(keys: string[]): Promise<string[]> {
  if (!keys.length) return [];

  const res = await Promise.all(
    keys.slice(0, 3).map(async (key) => {
      try {
        const r = await fetch(`https://openlibrary.org${key}.json`);
        if (!r.ok) return null;
        const d = (await r.json()) as OpenLibraryAuthorResponse;
        return isString(d.name) ? d.name : null;
      } catch {
        return null;
      }
    })
  );

  return res.filter((x): x is string => Boolean(x));
}

async function lookupGoogleBooks(isbn: string): Promise<LookupResult> {
  try {
    const r = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`
    );
    if (!r.ok) return { title: undefined, authors: [], coverUrl: undefined };

    const data = (await r.json()) as GoogleBooksResponse;
    const item = data.items?.[0];
    const info = item?.volumeInfo;
    if (!info) return { title: undefined, authors: [], coverUrl: undefined };

    const title = isString(info.title) ? info.title : undefined;

    const authors =
      Array.isArray(info.authors) ? (info.authors as unknown[]).filter(isString) : [];

    const volumeId = typeof item?.id === "string" ? item.id : "";

    // Haal Google Books thumbnail op (deze werken vaak beter dan stable API)
    const rawThumb =
      (typeof info.imageLinks?.thumbnail === "string" ? info.imageLinks.thumbnail : "") ||
      (typeof info.imageLinks?.smallThumbnail === "string" ? info.imageLinks.smallThumbnail : "");

    // Verbeter Google Books thumbnail URL voor betere kwaliteit
    const googleThumbnail = getGoogleBooksThumbnailUrl(rawThumb);

    // Stable Google Books API URL (als fallback)
    const stableGoogleCover = volumeId
      ? `https://books.google.com/books/content?id=${encodeURIComponent(
          volumeId
        )}&printsec=frontcover&img=1&zoom=2&source=gbs_api`
      : "";

    // Open Library cover (altijd beschikbaar, beste mobiel compatibiliteit)
    const openLibraryCover = coverFromOpenLibrary(isbn, "M");
    
    // Sla de cover URL op voor referentie, maar we laden altijd direct van Open Library
    // Dit voorkomt CORS problemen en werkt betrouwbaar op alle devices
    // We slaan de beste beschikbare URL op (voor toekomstige referentie)
    const coverUrl = googleThumbnail || openLibraryCover || stableGoogleCover;

    return { title, authors, coverUrl };
  } catch {
    return { title: undefined, authors: [], coverUrl: undefined };
  }
}
