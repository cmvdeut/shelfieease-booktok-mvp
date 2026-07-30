# Book detail sheet (sfeer-first) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the library book detail bottom sheet into a shelf-metadata card (cover, title, synopsis blurb, pills) with edit behind “Bewerken”, and persist synopsis from EasyCB at add time.

**Architecture:** Extend `Book` + `LookupResult` with optional `synopsis`. EasyCB already returns a `synopsis` key — parse, strip HTML, merge into lookup. Library add flow copies it onto the book. Detail sheet gains `detailEditMode` boolean: view (no inputs) vs edit (existing form). Pure string helpers live in `lib/synopsis.ts` for testability.

**Tech Stack:** Next.js 16 App Router, React client components, TypeScript, localStorage via `lib/storage.ts`, EasyCB text API, existing inline styles / CSS variables from `app/layout.tsx`.

**Spec:** `docs/superpowers/specs/2026-07-30-book-detail-sheet-design.md`

## Global Constraints

- Product is a **physical shelf tracker**, not an e-reader — no reader chrome, no “Nu lezen” of manuscript, synopsis = short trade catalog blurb only  
- UI default language: **Dutch (NL)**; `je`-tone; copy “Meer tonen” / “Geen synopsis” / “Bewerken”  
- No social feed, no page-% progress, no backfill of synopsis for old books this pass  
- No new routes; stay inside existing sheet in `app/library/page.tsx`  
- Commits: only when the user explicitly asks (project rule) — skip commit steps until then  
- Repo has **no** Jest/Vitest suite; verify pure helpers with `npx tsx` + `node:assert`, and UI manually  

## File map

| File | Responsibility |
|------|----------------|
| `lib/synopsis.ts` | Create — strip HTML entities/tags, normalize whitespace for stored blurb |
| `lib/synopsis.selftest.ts` | Create — assert helpers (run via tsx) |
| `lib/storage.ts` | Add optional `synopsis?: string` on `Book`; preserve on load |
| `lib/lookup.ts` | `LookupResult.synopsis`; EasyCB parse; `mergeLookup` fills missing synopsis |
| `app/library/page.tsx` | pendingData + upsert copy synopsis; detail view/edit modes + synopsis UI |
| `design.md` | One bullet under live alignment |

---

### Task 1: Synopsis string helpers

**Files:**
- Create: `lib/synopsis.ts`
- Create: `lib/synopsis.selftest.ts`

**Interfaces:**
- Produces: `normalizeSynopsis(raw: string | undefined | null): string` — returns trimmed plain text or `""`
- Produces: `decodeBasicEntities(s: string): string` (internal or exported if needed by tests)

- [ ] **Step 1: Write selftest that fails (helpers missing)**

Create `lib/synopsis.selftest.ts`:

```ts
import assert from "node:assert/strict";
import { normalizeSynopsis } from "./synopsis";

assert.equal(normalizeSynopsis(undefined), "");
assert.equal(normalizeSynopsis("  hello  "), "hello");
assert.equal(
  normalizeSynopsis("Korte <em>tekst</em> met<br> breaks &amp; entities."),
  "Korte tekst met breaks & entities."
);
assert.equal(normalizeSynopsis("<p>Een&nbsp;boek.</p>"), "Een boek.");
console.log("synopsis.selftest: OK");
```

- [ ] **Step 2: Run selftest — expect fail (module missing)**

Run: `npx tsx lib/synopsis.selftest.ts`  
Expected: error resolving `./synopsis` or `normalizeSynopsis`

- [ ] **Step 3: Implement `lib/synopsis.ts`**

```ts
/** Plain-text trade blurb for shelf cards (not e-reader content). */
export function normalizeSynopsis(raw: string | undefined | null): string {
  if (!raw) return "";
  let s = String(raw);
  s = s.replace(/<\s*br\s*\/?>/gi, " ");
  s = s.replace(/<\/p>/gi, " ");
  s = s.replace(/<[^>]+>/g, "");
  s = decodeBasicEntities(s);
  s = s.replace(/\u00a0/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function decodeBasicEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}
```

- [ ] **Step 4: Re-run selftest — expect OK**

Run: `npx tsx lib/synopsis.selftest.ts`  
Expected: `synopsis.selftest: OK`

- [ ] **Step 5: Commit** (only if user asked)

```bash
git add lib/synopsis.ts lib/synopsis.selftest.ts
git commit -m "feat: add synopsis plain-text normalizer"
```

---

### Task 2: Persist `synopsis` on Book

**Files:**
- Modify: `lib/storage.ts` (`Book` type ~line 33–45; `loadBooks` clean loop ~242–300)

**Interfaces:**
- Consumes: none from Task 1  
- Produces: `Book.synopsis?: string` round-trips through `saveBooks` / `loadBooks` / `upsertBook` / `updateBook`

- [ ] **Step 1: Extend `Book` type**

In `lib/storage.ts`, add to `Book`:

```ts
export type Book = {
  id: string;
  isbn13: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  /** Optional trade catalog blurb (plain text). Not book body / e-reader content. */
  synopsis?: string;
  status?: BookStatus;
  format?: BookFormat;
  shelfId: string;
  addedAt: number;
  updatedAt: number;
};
```

- [ ] **Step 2: Preserve synopsis in `loadBooks` cleaner**

Inside the loop that builds each `Book`, after `coverUrl`:

```ts
const synopsis =
  typeof item.synopsis === "string" ? item.synopsis : undefined;
if (typeof item.synopsis !== "string" && typeof item.synopsis !== "undefined") {
  changed = true;
}
```

Include `synopsis` on the pushed `Book` object (spread/explicit field). Do **not** drop unknown books that lack the field.

- [ ] **Step 3: Smoke-check TypeScript**

Run: `npx tsc --noEmit` (or project’s usual typecheck if different)  
Expected: no new errors related to `synopsis` (existing project errors unrelated may remain — only fix what this change introduces)

- [ ] **Step 4: Commit** (only if user asked)

```bash
git add lib/storage.ts
git commit -m "feat: optional synopsis field on Book"
```

---

### Task 3: Lookup returns EasyCB synopsis

**Files:**
- Modify: `lib/lookup.ts`

**Interfaces:**
- Consumes: `normalizeSynopsis` from `lib/synopsis.ts`  
- Produces: `LookupResult = { title; authors; coverUrl; synopsis?: string }`  
- Produces: `mergeLookup` fills `synopsis` when `into` is empty  
- Produces: `easyCbMetadataByIsbn` sets `synopsis` from EasyCB `synopsis` key  
- Produces: `emptyLookup()` includes `synopsis: ""` or omits (prefer `synopsis: ""` for merge simplicity)

- [ ] **Step 1: Extend `LookupResult` and `emptyLookup`**

```ts
export type LookupResult = {
  title: string;
  authors: string[];
  coverUrl: string;
  synopsis?: string;
};

function emptyLookup(): LookupResult {
  return { title: "", authors: [], coverUrl: "", synopsis: "" };
}
```

- [ ] **Step 2: Update `mergeLookup`**

```ts
function mergeLookup(into: LookupResult, from: LookupResult): LookupResult {
  return {
    title: into.title.trim() || from.title.trim(),
    authors: into.authors.length > 0 ? into.authors : from.authors,
    coverUrl: into.coverUrl || from.coverUrl,
    synopsis: (into.synopsis || "").trim() || (from.synopsis || "").trim(),
  };
}
```

- [ ] **Step 3: Parse EasyCB synopsis**

At top of `lib/lookup.ts`: `import { normalizeSynopsis } from "@/lib/synopsis";`

In `easyCbMetadataByIsbn`, after reading `fields`:

```ts
const synopsis = normalizeSynopsis(fields.synopsis || "");
return { title, authors, coverUrl: "", synopsis };
```

Update comment above EasyCB from “Title + author only” to “Title, author, synopsis”.

- [ ] **Step 4: Ensure final `lookupByIsbn` return includes synopsis**

Wherever `lookupByIsbn` returns `{ title, authors, coverUrl }`, include:

```ts
return {
  title: result.title,
  authors: result.authors,
  coverUrl,
  synopsis: (result.synopsis || "").trim(),
};
```

Other `LookupResult` constructors (`openLibrary*`, Google mapping in `searchBooksByTitleOrAuthor`) may omit synopsis (undefined/`""`) — merge only fills from EasyCB.

- [ ] **Step 5: Manual API verify (dev server must be running)**

Run:

```powershell
Invoke-RestMethod "http://127.0.0.1:3000/api/lookup?isbn=9789025473877" | ConvertTo-Json -Depth 3
```

Expected: `title` ≈ `De proloog`, `authors` includes Horst, **`synopsis` non-empty plain text** (no `<br>` / `<em>`).

Also: `9780141036144` (Orwell) — may have empty synopsis (OK).

- [ ] **Step 6: Commit** (only if user asked)

```bash
git add lib/lookup.ts
git commit -m "feat: include EasyCB synopsis in ISBN lookup"
```

---

### Task 4: Save synopsis when adding a book

**Files:**
- Modify: `app/library/page.tsx` (`pendingData` state ~79; ISBN lookup effect ~299; `addBookToShelfInternal` ~740; any other `setPendingData` that clears shape)

**Interfaces:**
- Consumes: lookup JSON may include `synopsis`  
- Produces: new `Book` records include `synopsis` when lookup provided it

- [ ] **Step 1: Widen pendingData type**

```ts
const [pendingData, setPendingData] = useState<{
  title?: string;
  authors?: string[];
  coverUrl?: string;
  synopsis?: string;
} | null>(null);
```

- [ ] **Step 2: Copy synopsis from lookup into pendingData**

Where successful lookup sets pendingData (~299):

```ts
setPendingData({
  title: hasTitle ? data.title : "Onbekend",
  authors: data.authors || [],
  coverUrl: data.coverUrl && !isBadCoverUrl(data.coverUrl) ? data.coverUrl : "",
  synopsis: (data.synopsis || "").trim(),
});
```

Error fallback / empty pendingData: `synopsis: ""`.

- [ ] **Step 3: Persist on upsert in `addBookToShelfInternal`**

```ts
const book: Book = {
  id: pendingIsbn,
  isbn13: pendingIsbn,
  title: finalTitle,
  authors: finalAuthors,
  coverUrl: pendingData?.coverUrl || "",
  synopsis: (pendingData?.synopsis || "").trim() || undefined,
  shelfId: targetShelfId,
  status: "TBR" as BookStatus,
  addedAt: now,
  updatedAt: now,
};
```

- [ ] **Step 4: Manual check**

1. Dev server + browser `/library?addIsbn=9789025473877`  
2. Add to shelf  
3. In DevTools: `JSON.parse(localStorage.getItem('shelfieease_books_v1')).find(b => b.isbn13==='9789025473877').synopsis`  
Expected: non-empty string without HTML tags

- [ ] **Step 5: Commit** (only if user asked)

```bash
git add app/library/page.tsx
git commit -m "feat: store synopsis on book add from lookup"
```

---

### Task 5: Detail sheet view vs edit mode + synopsis UI

**Files:**
- Modify: `app/library/page.tsx` (state near `editingBookId` ~133; `handleEditBook` ~876; sheet JSX ~2027–2344)

**Interfaces:**
- Consumes: `Book.synopsis`  
- Produces: opening a book → view mode; **Bewerken** → edit mode; **Opslaan** / **Annuleren** → view (or close); synopsis clamp + “Meer tonen”

- [ ] **Step 1: Add sheet UI state**

Near other edit state:

```ts
const [detailEditMode, setDetailEditMode] = useState(false);
const [synopsisExpanded, setSynopsisExpanded] = useState(false);
```

In `handleEditBook`, after setting fields:

```ts
setDetailEditMode(false);
setSynopsisExpanded(false);
setEditingBookId(bookId);
```

When closing sheet (`setEditingBookId(null)`), also reset:

```ts
setDetailEditMode(false);
setSynopsisExpanded(false);
```

(Do this in every close path: back button, overlay click, after successful save.)

- [ ] **Step 2: View-mode block (replace always-visible form)**

Keep top bar + cover + frosted strip + serif title + author as today.

**After author**, before pills, add synopsis (view only):

```tsx
{!detailEditMode && (
  <div style={{ margin: "0 0 16px", textAlign: "left", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
    {editingBook?.synopsis?.trim() ? (
      <>
        <p
          style={{
            margin: 0,
            color: "var(--muted)",
            fontSize: 14,
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: synopsisExpanded ? "unset" : 4,
            WebkitBoxOrient: "vertical",
            overflow: synopsisExpanded ? "visible" : "hidden",
          }}
        >
          {editingBook.synopsis}
        </p>
        {editingBook.synopsis.length > 220 && (
          <button
            type="button"
            onClick={() => setSynopsisExpanded((v) => !v)}
            style={{
              marginTop: 6,
              border: "none",
              background: "transparent",
              color: "var(--accent1)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {synopsisExpanded
              ? t({ nl: "Minder tonen", en: "Show less" }, lang)
              : t({ nl: "Meer tonen", en: "Show more" }, lang)}
          </button>
        )}
      </>
    ) : (
      <p style={{ margin: 0, color: "var(--muted2)", fontSize: 13, fontStyle: "italic" }}>
        {t({ nl: "Geen synopsis", en: "No synopsis" }, lang)}
      </p>
    )}
  </div>
)}
```

Keep **pills** visible in view mode (status/shelf display pills as now). Do **not** show title/author/ISBN/cover inputs in view mode.

Footer in view mode:

```tsx
{!detailEditMode && (
  <div style={{ ...modalActions, marginTop: 8 }}>
    <button
      type="button"
      style={{ ...btnGhost, width: "100%", justifyContent: "center" }}
      onClick={() => setDetailEditMode(true)}
    >
      {t({ nl: "Bewerken", en: "Edit" }, lang)}
    </button>
  </div>
)}
```

- [ ] **Step 3: Edit-mode form**

Wrap existing `modalForm` + Opslaan/Cancel in `{detailEditMode && ( ... )}`.

- Cancel / Annuleren: `setDetailEditMode(false)` (stay on sheet in view) — do **not** require discarding title edits if user cancels without save (revert fields from `editingBook`):

```ts
onClick={() => {
  if (!editingBook) return;
  setEditTitle(editingBook.title || "");
  setEditAuthors(editingBook.authors?.join(", ") || "");
  setEditIsbn(editingBook.isbn13 || "");
  setEditCoverUrl(editingBook.coverUrl || "");
  setDetailEditMode(false);
}}
```

- Opslaan (`handleSaveBookEdit`): after `updateBook` + reload, **`setDetailEditMode(false)`** instead of closing sheet (`setEditingBookId(null)`), so user returns to view with updated title. Change button label to `{t({ nl: "Opslaan", en: "Save" }, lang)}` (spec); drop “op plank” if it implies wrong metaphor — use **Opslaan**.

- Soft CSS: on the mode content wrapper optional `animation: fade 180ms ease` using existing `css` block if present; skip if awkward.

- [ ] **Step 4: Manual UI checklist**

1. Open book **with** synopsis → view: no inputs; synopsis + Bewerken  
2. Meer tonen / Minder tonen works on long blurb  
3. Bewerken → inputs; Annuleren restores + view  
4. Edit title → Opslaan → view shows new title, sheet stays open  
5. Book **without** synopsis → “Geen synopsis” italic, calm  
6. Share ↗ and status/format frosted strip still work  
7. Confirm no e-reader wording in UI  

- [ ] **Step 5: Commit** (only if user asked)

```bash
git add app/library/page.tsx
git commit -m "feat: shelf-card detail sheet with view/edit and synopsis"
```

---

### Task 6: Design doc note

**Files:**
- Modify: `design.md` (section “Live app alignment (2026-07)” ~147+)

- [ ] **Step 1: Add bullet**

```markdown
- Book detail sheet: shelf-card view (synopsis blurb, no e-reader) · Bewerken for fields · synopsis stored at add from EasyCB
```

- [ ] **Step 2: Mark spec status**

In `docs/superpowers/specs/2026-07-30-book-detail-sheet-design.md` header, set:

`**Status:** Approved · implementation plan ready`

- [ ] **Step 3: Commit** (only if user asked)

```bash
git add design.md docs/superpowers/specs/2026-07-30-book-detail-sheet-design.md
git commit -m "docs: note detail sheet shelf-card alignment"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| View = shelf card, not e-reader | 5 + Global Constraints |
| Synopsis at add (EasyCB) | 1, 3, 4 |
| Default read-only / Bewerken | 5 |
| Same sheet view/edit | 5 |
| `Book.synopsis?` + load tolerance | 2 |
| Empty state “Geen synopsis” | 5 |
| Meer tonen | 5 |
| No backfill / no hero / no scan polish | Out of scope — no tasks |
| design.md note | 6 |

**Placeholder scan:** none intentional.  
**Type consistency:** `synopsis?: string` on `Book` and `LookupResult`; `normalizeSynopsis` → EasyCB → pendingData → Book.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-30-book-detail-sheet.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — run tasks in this session with checkpoints  

Which approach?
