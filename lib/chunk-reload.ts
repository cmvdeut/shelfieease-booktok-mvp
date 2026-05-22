export const CHUNK_LOAD_ERROR = "Failed to load chunk";

export function isChunkLoadError(message?: string | null): boolean {
  return Boolean(message?.includes(CHUNK_LOAD_ERROR));
}

/** Reload once or twice with a cache-busting query param. Returns true if navigating away. */
export function tryRecoverFromChunkError(): boolean {
  if (typeof window === "undefined") return false;
  const key = "se:chunk-reload-attempt";
  try {
    const attempts = parseInt(sessionStorage.getItem(key) || "0", 10);
    if (attempts >= 2) return false;
    sessionStorage.setItem(key, String(attempts + 1));
    const url = new URL(window.location.href);
    url.searchParams.set("_se", String(Date.now()));
    window.location.replace(url.toString());
    return true;
  } catch {
    window.location.reload();
    return true;
  }
}

export function clearChunkReloadAttempts(): void {
  try {
    sessionStorage.removeItem("se:chunk-reload-attempt");
  } catch {
    // ignore
  }
}
