"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { detectUiLang, t } from "@/lib/i18n";
import { createBackup, restoreBackupFromFile, downloadJson, getBackupFilename } from "@/lib/backup";
import { loadBooks, loadShelves, getActiveShelfId } from "@/lib/storage";
import { shareShelfAsPdf } from "@/lib/pdf";

export function AppMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const lang = detectUiLang();

  const showToast = useCallback((message: string, duration: number = 3000) => {
    setToast(message);
    window.setTimeout(() => setToast(null), duration);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowDeleteConfirm(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleBackup() {
    try {
      const backup = createBackup();
      const filename = getBackupFilename();
      downloadJson(filename, backup);
      setIsOpen(false);
      showToast("Backup file downloaded");
    } catch (error) {
      console.error("Error creating backup:", error);
      showToast(t({ nl: "Fout bij maken van backup", en: "Error creating backup" }, lang));
    }
  }

  function handleRestore() {
    setIsOpen(false);

    // Small delay to ensure menu closes before file dialog opens
    setTimeout(() => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.style.display = "none";
      document.body.appendChild(input);

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          document.body.removeChild(input);
          return;
        }

        // Validate file type
        const isJsonFile = file.name.toLowerCase().endsWith(".json") || 
                          file.type === "application/json" || 
                          file.type === "text/json" ||
                          file.type === ""; // Some browsers don't set type

        if (!isJsonFile) {
          showToast(t({ nl: "Ongeldig bestand", en: "Invalid file" }, lang));
          document.body.removeChild(input);
          return;
        }

        // Confirm before overwriting
        const confirmMessage = t(
          {
            nl: "Dit zal al je huidige data overschrijven. Weet je zeker dat je de backup wilt terugzetten?",
            en: "This will overwrite all your current data. Are you sure you want to restore the backup?",
          },
          lang
        );

        if (!confirm(confirmMessage)) {
          document.body.removeChild(input);
          return;
        }

        try {
          const result = await restoreBackupFromFile(file);
          document.body.removeChild(input);
          
          // Set flag in localStorage to show toast after reload
          try {
            localStorage.setItem("shelfie_toast", "backup_restored");
          } catch {
            // Ignore storage errors
          }
          
          // Reload to apply changes
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } catch (error) {
          document.body.removeChild(input);
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (errorMessage.includes("Invalid backup") || errorMessage.includes("Invalid JSON") || errorMessage.includes("Invalid backup file format")) {
            showToast("Invalid backup file");
          } else if (errorMessage.includes("storage space") || errorMessage.includes("QuotaExceeded")) {
            showToast("Not enough storage space");
          } else {
            showToast("Error restoring backup");
          }
          console.error("Error restoring backup:", error);
        }
      };

      // Handle cancel
      input.oncancel = () => {
        document.body.removeChild(input);
      };

      // Trigger file picker
      input.click();
    }, 100);
  }

  function handleSharePdf() {
    try {
      const books = loadBooks();
      const shelves = loadShelves();
      const activeShelfId = getActiveShelfId();

      // Determine which books to include
      let booksToShare: typeof books;
      let shelfTitle: string;

      if (activeShelfId) {
        // Share active shelf
        const activeShelf = shelves.find((s) => s.id === activeShelfId);
        if (!activeShelf) {
          showToast(t({ nl: "Shelf niet gevonden", en: "Shelf not found" }, lang));
          return;
        }
        booksToShare = books.filter((b) => b.shelfId === activeShelfId);
        shelfTitle = `${activeShelf.emoji} ${activeShelf.name}`;
      } else {
        // Share all shelves
        booksToShare = books;
        shelfTitle = "All Shelves";
      }

      if (booksToShare.length === 0) {
        showToast(t({ nl: "Geen boeken om te delen", en: "No books to share" }, lang));
        return;
      }

      shareShelfAsPdf({
        title: shelfTitle,
        books: booksToShare,
      });

      setIsOpen(false);
      showToast("Shelf PDF downloaded");
    } catch (error) {
      console.error("Error sharing PDF:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("No books")) {
        showToast(t({ nl: "Geen boeken om te delen", en: "No books to share" }, lang));
      } else {
        showToast(t({ nl: "Fout bij maken van PDF", en: "Error creating PDF" }, lang));
      }
    }
  }

  function handleDeleteAll() {
    try {
      // Get all keys that start with "se:" or "shelfieease_"
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("se:") || key.startsWith("shelfieease_"))) {
          keysToDelete.push(key);
        }
      }

      // Delete all keys
      keysToDelete.forEach((key) => {
        localStorage.removeItem(key);
      });

      setShowDeleteConfirm(false);
      setIsOpen(false);
      // Reload to apply changes
      window.location.reload();
    } catch (error) {
      console.error("Error deleting data:", error);
      alert(t({ nl: "Fout bij wissen van data", en: "Error deleting data" }, lang));
    }
  }

  const menuItems = [
    {
      label: t({ nl: "Backup maken", en: "Create backup" }, lang),
      onClick: handleBackup,
      disabled: false,
    },
    {
      label: t({ nl: "Backup terugzetten", en: "Restore backup" }, lang),
      onClick: handleRestore,
      disabled: false,
    },
    {
      label: t({ nl: "PDF delen", en: "Share PDF" }, lang),
      onClick: handleSharePdf,
      disabled: false,
    },
    {
      label: `📊 ${t({ nl: "Statistieken", en: "Statistics" }, lang)}`,
      href: "/stats",
      disabled: false,
    },
    {
      label: t({ nl: "Privacybeleid", en: "Privacy policy" }, lang),
      href: "/privacy",
      disabled: false,
    },
    {
      label: t({ nl: "Help", en: "Help" }, lang),
      href: "/help",
      disabled: false,
    },
    {
      label: t({ nl: "Wis alle data", en: "Delete all data" }, lang),
      onClick: () => setShowDeleteConfirm(true),
      disabled: false,
      danger: true,
    },
  ];

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: `calc(12px + env(safe-area-inset-top, 0px))`,
          right: 12,
          zIndex: 9999,
        }}
      >
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            cursor: "pointer",
            padding: 0,
            boxShadow: `0 2px 8px var(--shadow)`,
          }}
          aria-label={t({ nl: "Menu", en: "Menu" }, lang)}
        >
          ⋯
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: 48,
              right: 0,
              minWidth: 200,
              background: "var(--panelSolid)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              boxShadow: `0 8px 24px var(--shadow)`,
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {menuItems.map((item, index) => {
              const content = (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    fontSize: 14,
                    color: item.danger ? "var(--danger)" : item.disabled ? "var(--muted2)" : "var(--text)",
                    cursor: item.disabled ? "not-allowed" : "pointer",
                    opacity: item.disabled ? 0.5 : 1,
                    background: item.danger ? "var(--dangerSoft)" : "transparent",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) {
                      e.currentTarget.style.background = item.danger ? "var(--dangerSoft)" : "var(--panel2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = item.danger ? "var(--dangerSoft)" : "transparent";
                  }}
                  onClick={() => {
                    if (!item.disabled) {
                      if (item.href) {
                        setIsOpen(false);
                        router.push(item.href);
                      } else if (item.onClick) {
                        item.onClick();
                      }
                    }
                  }}
                >
                  {item.label}
                </div>
              );

              if (item.href && !item.disabled) {
                return (
                  <Link key={index} href={item.href} style={{ textDecoration: "none" }}>
                    {content}
                  </Link>
                );
              }

              return <div key={index}>{content}</div>;
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: "var(--panelSolid)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              boxShadow: `0 8px 32px var(--shadow)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 12,
              }}
            >
              {t({ nl: "Alles wissen?", en: "Delete everything?" }, lang)}
            </h2>
            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.5,
                marginBottom: 24,
                fontSize: 14,
              }}
            >
              {t(
                {
                  nl: "Dit verwijdert al je boeken, shelves en instellingen van dit apparaat. Dit kan niet ongedaan worden gemaakt.",
                  en: "This will delete all your books, shelves and settings from this device. This cannot be undone.",
                },
                lang
              )}
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--btnGhostBg)",
                  color: "var(--text)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t({ nl: "Annuleren", en: "Cancel" }, lang)}
              </button>
              <button
                onClick={handleDeleteAll}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "1px solid var(--danger)",
                  background: "var(--danger)",
                  color: typeof document !== "undefined" && document.documentElement.dataset.mood === "calm" ? "#4A3825" : "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t({ nl: "Wis alles", en: "Delete all" }, lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            padding: "12px 20px",
            borderRadius: 16,
            fontWeight: 700,
            zIndex: 10001,
            backdropFilter: "blur(12px)",
            pointerEvents: "none",
            color: "var(--text)",
            fontSize: 14,
            whiteSpace: "nowrap",
            boxShadow: `0 8px 24px var(--shadow)`,
            opacity: 0.95,
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}

