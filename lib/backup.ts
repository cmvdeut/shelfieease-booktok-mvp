import { loadBooks, loadShelves, getActiveShelfId, saveBooks, saveShelves, setActiveShelfId } from "./storage";

export type BackupData = {
  app: "shelfieease";
  version: number;
  exportedAt: string;
  data: {
    shelves: ReturnType<typeof loadShelves>;
    books: ReturnType<typeof loadBooks>;
    settings: {
      mood: string | null;
      paid: boolean;
    };
    activeShelfId: string | null;
  };
};

/**
 * Download a JSON object as a file
 */
export function downloadJson(filename: string, obj: unknown): void {
  try {
    const json = JSON.stringify(obj, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up after a short delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Error downloading JSON:", error);
    throw error;
  }
}

/**
 * Create a backup of all app data
 */
export function createBackup(): BackupData {
  const books = loadBooks();
  const shelves = loadShelves();
  const activeShelfId = getActiveShelfId();
  
  // Get mood from localStorage
  let mood: string | null = null;
  try {
    mood = localStorage.getItem("se:mood");
  } catch {
    // Ignore
  }
  
  // Get paid status from localStorage
  let paid = false;
  try {
    paid = localStorage.getItem("se:pro") === "1";
  } catch {
    // Ignore
  }
  
  const backup: BackupData = {
    app: "shelfieease",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      shelves,
      books,
      settings: {
        mood,
        paid,
      },
      activeShelfId,
    },
  };
  
  return backup;
}

/**
 * Validate backup file structure
 */
export function validateBackup(backup: unknown): backup is BackupData {
  if (!backup || typeof backup !== "object") return false;
  
  const b = backup as Record<string, unknown>;
  
  // Check app name
  if (b.app !== "shelfieease") return false;
  
  // Check version
  if (typeof b.version !== "number") return false;
  
  // Check data object
  if (!b.data || typeof b.data !== "object") return false;
  
  const data = b.data as Record<string, unknown>;
  
  // Check shelves array
  if (!Array.isArray(data.shelves)) return false;
  
  // Check books array
  if (!Array.isArray(data.books)) return false;
  
  return true;
}

/**
 * Restore backup from file
 */
export function restoreBackupFromFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        if (!json || json.trim().length === 0) {
          reject(new Error("Empty file"));
          return;
        }
        
        const backup = JSON.parse(json);
        
        // Validate backup structure
        if (!validateBackup(backup)) {
          reject(new Error("Invalid backup file format"));
          return;
        }
        
        // Restore data
        try {
          // First, clear existing ShelfieEase data to avoid conflicts
          const keysToDelete: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("se:") || key.startsWith("shelfieease_"))) {
              keysToDelete.push(key);
            }
          }
          keysToDelete.forEach((key) => {
            try {
              localStorage.removeItem(key);
            } catch {
              // Ignore errors
            }
          });

          // Restore shelves
          saveShelves(backup.data.shelves);
          
          // Restore books
          saveBooks(backup.data.books);
          
          // Restore active shelf ID
          if (backup.data.activeShelfId) {
            setActiveShelfId(backup.data.activeShelfId);
          }
          
          // Restore settings with defaults if missing
          const settings = backup.data.settings || {};
          
          // Restore mood (default to "aesthetic" if missing)
          const mood = settings.mood || "aesthetic";
          try {
            localStorage.setItem("se:mood", mood);
          } catch {
            // Ignore storage errors
          }
          
          // Restore paid status (default to false if missing)
          const paid = settings.paid === true;
          try {
            localStorage.setItem("se:pro", paid ? "1" : "0");
          } catch {
            // Ignore storage errors
          }
          
          resolve();
        } catch (storageError) {
          console.error("Error restoring backup:", storageError);
          if (storageError instanceof Error && storageError.name === "QuotaExceededError") {
            reject(new Error("Not enough storage space"));
          } else {
            reject(new Error("Failed to restore backup data"));
          }
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error("Invalid JSON file"));
        } else {
          reject(error instanceof Error ? error : new Error("Unknown error"));
        }
      }
    };
    
    reader.readAsText(file);
  });
}

/**
 * Get backup filename with current date
 */
export function getBackupFilename(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `shelfieease-backup-${year}${month}${day}.json`;
}

