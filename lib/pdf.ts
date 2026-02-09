import { jsPDF } from "jspdf";
import type { Book } from "./storage";
import { normalizeStatus } from "./storage";
import { getCoverUrlForShare } from "./covers";

const COVER_WIDTH_MM = 24;
const COVER_HEIGHT_MM = 36; // ~2:3 ratio
const COVER_GAP_MM = 8;
const ROW_MIN_HEIGHT_MM = 40;

function toHttps(url: string): string {
  if (!url || typeof url !== "string") return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

/** Load cover image as data URL via same-origin proxy (for PDF embedding). */
async function loadCoverDataUrl(coverUrl: string, origin: string): Promise<string | null> {
  const url = toHttps(coverUrl);
  if (!url || !origin) return null;
  const proxyUrl = `${origin}/api/cover?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    const contentType = blob.type || "image/jpeg";
    return await new Promise<string | null>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function shareShelfAsPdf(params: {
  title: string;
  books: Book[];
  origin?: string;
}): Promise<void> {
  const { title, books, origin = typeof window !== "undefined" ? window.location.origin : "" } = params;

  if (books.length === 0) {
    throw new Error("No books to share");
  }

  // Preload cover images via proxy so we can embed them in the PDF
  const coverDataUrls = await Promise.all(
    books.map((book) => {
      const coverUrl = getCoverUrlForShare(book);
      return coverUrl ? loadCoverDataUrl(coverUrl, origin) : Promise.resolve(null);
    })
  );

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const textStartX = margin + COVER_WIDTH_MM + COVER_GAP_MM;
  const contentWidth = pageWidth - margin * 2 - COVER_WIDTH_MM - COVER_GAP_MM;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`📚 ${title}`, margin, y);
  y += 12;

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setTextColor(100, 100, 100);
  doc.text(dateStr, margin, y);
  y += 15;

  // Books list with optional cover thumbnail
  doc.setTextColor(0, 0, 0);
  books.forEach((book, index) => {
    if (y > pageHeight - ROW_MIN_HEIGHT_MM - 10) {
      doc.addPage();
      y = margin;
    }

    const rowStartY = y;
    const coverDataUrl = coverDataUrls[index];

    // Draw cover thumbnail (left side)
    if (coverDataUrl) {
      try {
        const format = coverDataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(
          coverDataUrl,
          format,
          margin,
          y,
          COVER_WIDTH_MM,
          COVER_HEIGHT_MM
        );
      } catch {
        // If addImage fails (e.g. format), skip cover
      }
    }

    // Title (right of cover)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const bookTitle = book.title?.trim() || "Untitled";
    const titleLines = doc.splitTextToSize(bookTitle, contentWidth);
    doc.text(titleLines, textStartX, y + 6);
    y += titleLines.length * 7;

    // Author
    if (book.authors && book.authors.length > 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(60, 60, 60);
      const authorText = book.authors.join(", ");
      const authorLines = doc.splitTextToSize(authorText, contentWidth);
      doc.text(authorLines, textStartX, y + 2);
      y += authorLines.length * 6;
    }

    // Meta: ISBN + Status + Format
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const status = normalizeStatus(book.status);
    const statusLabel = status === "Finished" ? "Read" : status === "Reading" ? "Reading" : "TBR";
    const formatIcon = book.format === "ebook" ? "📱 " : "";
    const metaText = `ISBN: ${book.isbn13} • ${statusLabel}${formatIcon ? ` • ${formatIcon}` : ""}`;
    doc.text(metaText, textStartX, y + 2);
    y += 8;

    // Ensure row height fits cover
    const rowHeight = y - rowStartY;
    if (rowHeight < ROW_MIN_HEIGHT_MM) {
      y = rowStartY + ROW_MIN_HEIGHT_MM;
    }

    if (index < books.length - 1) {
      y += 6;
    }
  });

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Generated with ShelfieEase", pageWidth / 2, footerY, {
    align: "center",
  });

  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  doc.save(`shelfie-${safeTitle}.pdf`);
}
