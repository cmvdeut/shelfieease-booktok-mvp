import { jsPDF } from "jspdf";
import type { Book } from "./storage";
import { normalizeStatus } from "./storage";

export function shareShelfAsPdf(params: {
  title: string;
  books: Book[];
}): void {
  const { title, books } = params;

  if (books.length === 0) {
    throw new Error("No books to share");
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
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

  // Books list
  doc.setTextColor(0, 0, 0);
  books.forEach((book, index) => {
    // Check if we need a new page
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const bookTitle = book.title?.trim() || "Untitled";
    const titleLines = doc.splitTextToSize(bookTitle, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 7;

    // Author (optional)
    if (book.authors && book.authors.length > 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(60, 60, 60);
      const authorText = book.authors.join(", ");
      const authorLines = doc.splitTextToSize(authorText, contentWidth);
      doc.text(authorLines, margin, y);
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
    
    doc.text(metaText, margin, y);
    y += 10;

    // Spacing between books
    if (index < books.length - 1) {
      y += 5;
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

  // Generate filename
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filename = `shelfie-${safeTitle}.pdf`;

  // Download
  doc.save(filename);
}

