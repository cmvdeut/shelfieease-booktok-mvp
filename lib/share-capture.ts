import { toBlob } from "html-to-image";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

/** Preload a remote cover via same-origin proxy as a data URL (for share/PDF capture). */
export async function preloadCoverDataUrl(
  rawCoverUrl: string,
  origin: string
): Promise<string> {
  const url = rawCoverUrl.startsWith("http://")
    ? rawCoverUrl.replace("http://", "https://")
    : rawCoverUrl;
  if (!url || !origin) return "";

  const proxyUrl = `${origin}/api/cover?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) return "";
    const blob = await res.blob();
    if (!blob.size) return "";
    return await new Promise<string>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(typeof fr.result === "string" ? fr.result : "");
      fr.onerror = () => resolve("");
      fr.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

/** Wait until all images inside a node have loaded (or failed). */
export function waitForImagesIn(container: HTMLElement, timeoutMs = 8000): Promise<void> {
  const imgs = Array.from(container.querySelectorAll("img"));
  if (imgs.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    let pending = imgs.length;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const timer = window.setTimeout(finish, timeoutMs);

    const done = () => {
      pending -= 1;
      if (pending <= 0) {
        window.clearTimeout(timer);
        finish();
      }
    };

    for (const img of imgs) {
      if (img.complete && img.naturalWidth > 2) {
        done();
      } else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    }

    if (pending <= 0) {
      window.clearTimeout(timer);
      finish();
    }
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Canvas renderer — reliable fallback when html-to-image returns blank. */
export async function renderBookShareCardCanvas(params: {
  shelfLabel: string;
  bookTitle: string;
  coverDataUrl: string;
  width?: number;
  height?: number;
}): Promise<Blob> {
  const width = params.width ?? 1080;
  const height = params.height ?? 1400;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#1a1630");
  bg.addColorStop(0.5, "#12101f");
  bg.addColorStop(1, "#090812");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 64px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  wrapText(ctx, params.shelfLabel, width / 2, 72, width - 144, 74);

  const coverW = 500;
  const coverH = 750;
  const coverX = (width - coverW) / 2;
  const coverY = 220;

  roundRectPath(ctx, coverX, coverY, coverW, coverH, 18);
  ctx.fillStyle = "#1f1f28";
  ctx.fill();

  if (params.coverDataUrl) {
    try {
      const img = await loadImage(params.coverDataUrl);
      ctx.save();
      roundRectPath(ctx, coverX, coverY, coverW, coverH, 18);
      ctx.clip();
      ctx.drawImage(img, coverX, coverY, coverW, coverH);
      ctx.restore();
    } catch {
      // keep grey tile
    }
  }

  const grad = ctx.createLinearGradient(0, coverY + coverH - 220, 0, coverY + coverH);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.88)");
  ctx.fillStyle = grad;
  ctx.fillRect(coverX, coverY + coverH - 220, coverW, 220);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 40px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  wrapText(ctx, params.bookTitle, width / 2, coverY + coverH - 170, coverW - 32, 46);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "800 28px system-ui, sans-serif";
  ctx.fillText("ShelfieEase · shelfieease.app", width / 2, height - 72);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      "image/png"
    );
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(/\s+/);
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}

/** Capture a DOM node; temporarily makes it visible (html-to-image skips hidden nodes). */
export async function captureElementToBlob(
  element: HTMLElement,
  pixelRatio = 2
): Promise<Blob | null> {
  const host = element.parentElement;
  const saved = host
    ? {
        visibility: host.style.visibility,
        opacity: host.style.opacity,
        position: host.style.position,
        left: host.style.left,
        top: host.style.top,
        zIndex: host.style.zIndex,
        pointerEvents: host.style.pointerEvents,
      }
    : null;

  if (host) {
    host.style.visibility = "visible";
    host.style.opacity = "1";
    host.style.position = "fixed";
    host.style.left = "0";
    host.style.top = "0";
    host.style.zIndex = "-1";
    host.style.pointerEvents = "none";
  }

  try {
    await waitForImagesIn(element);
    return await toBlob(element, { cacheBust: true, pixelRatio });
  } finally {
    if (host && saved) {
      host.style.visibility = saved.visibility;
      host.style.opacity = saved.opacity;
      host.style.position = saved.position;
      host.style.left = saved.left;
      host.style.top = saved.top;
      host.style.zIndex = saved.zIndex;
      host.style.pointerEvents = saved.pointerEvents;
    }
  }
}

export function isLikelyBlankShareBlob(blob: Blob | null): boolean {
  return !blob || blob.size < 8000;
}
