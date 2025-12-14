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

  // 3) Last resort
  return {
    title: undefined,
    authors: [],
    coverUrl: coverFromOpenLibrary(isbn),
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

function coverFromOpenLibrary(isbn: string) {
  // Let op: Open Library heeft niet altijd een cover, maar dit is een goede fallback
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

async function lookupOpenLibrary(isbn: string): Promise<LookupResult> {
  try {
    const r = await fetch(`https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`);
    if (!r.ok) return { title: undefined, authors: [], coverUrl: coverFromOpenLibrary(isbn) };

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
      coverUrl: coverFromOpenLibrary(isbn),
    };
  } catch {
    return { title: undefined, authors: [], coverUrl: coverFromOpenLibrary(isbn) };
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
    const info = data.items?.[0]?.volumeInfo;
    if (!info) return { title: undefined, authors: [], coverUrl: undefined };

    const title = isString(info.title) ? info.title : undefined;

    const authors =
      Array.isArray(info.authors) ? (info.authors as unknown[]).filter(isString) : [];

    const rawCover =
      (isString(info.imageLinks?.thumbnail) ? info.imageLinks?.thumbnail : undefined) ||
      (isString(info.imageLinks?.smallThumbnail) ? info.imageLinks?.smallThumbnail : undefined) ||
      "";

    const coverUrl = toHttps(rawCover) || coverFromOpenLibrary(isbn);

    return { title, authors, coverUrl };
  } catch {
    return { title: undefined, authors: [], coverUrl: undefined };
  }
}
