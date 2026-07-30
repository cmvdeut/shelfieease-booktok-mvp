# Book detail sheet — sfeer-first (design)

**Date:** 2026-07-30  
**Status:** Approved · implementation plan ready (`docs/superpowers/plans/2026-07-30-book-detail-sheet.md`)  
**Product:** ShelfieEase (`shelfieease-booktok-mvp`)  
**Related:** `design.md` (Modern Bookish Romance), live sheet in `app/library/page.tsx`

---

## Goal

Make the book detail bottom sheet feel like a **shelf card for a physical book you own**, not an edit form and **not** an e-reader / in-app reading surface.  
Primary emotion: warm, bookish, calm. Edit stays available but secondary.

**Product reminder:** ShelfieEase stores shelf metadata (ISBN, cover, status, plank). It does **not** store book files or offer reading the book inside the app. “View mode” = look at your catalog card; synopsis is optional blurb from trade metadata, not chapter content.

## Locked decisions

| Decision | Choice |
|----------|--------|
| Focus | A — sfeer / synopsis / rustige meta (niet actie-first) |
| Synopsis storage | B — save once at add/scan into local book record |
| Edit UX | A — default read-only; full fields behind **Bewerken** |
| Implementation shape | Approach 1 — view/edit modes in the **same** sheet |
| Scope | Detail sheet + synopsis data path only |

## Out of scope

- “Nu aan het lezen” hero redesign  
- Scan / Ontdek polish  
- EasyCB cover image proxy / hotlink workarounds  
- Backfill synopsis for existing books without one  
- Page-% progress, social/feed, login  
- New screens or navigation changes  

---

## UX

### View mode (default when opening a book)

“View” = **browse your shelf entry** (metadata card). Not open-book / reader UI.

1. **Top bar:** back ← · brand “ShelfieEase” · share ↗  
2. **Cover:** large (existing proportions), frosted overlay strip with status / format / ISBN last-4  
3. **Title:** display serif, centered  
4. **Author:** italic muted “door …”  
5. **Synopsis:** short trade blurb under author (catalog copy, not full text)  
   - If present: ~2–4 lines clamped, optional “Meer tonen” expand  
   - If absent: quiet empty state (e.g. “Geen synopsis”) — no error chrome  
6. **Pills:** status · shelf · format — tap still changes value directly (existing behavior), not form fields  
7. **Footer action:** ghost/secondary **Bewerken** only (no always-visible inputs)

### Edit mode

- Same sheet; replace synopsis/read content with existing edit fields (title, authors, ISBN, cover URL)  
- Primary **Opslaan**, secondary **Annuleren** (or back) → return to view mode  
- Share / frosted strip may stay; keep layout from jumping harshly (light transition)

### Motion

- Sheet: existing bottom-sheet slide  
- Soft fade when entering view content / synopsis  
- Mode switch: short crossfade or height settle — no flashy motion

### Copy (NL default)

- Bewerken / Opslaan / Annuleren / Meer tonen / Geen synopsis  
- Keep `je`-tone; no social CTAs; avoid copy that sounds like “open to read” / e-reader  


---

## Data

### Model

Extend `Book` in `lib/storage.ts`:

```ts
synopsis?: string;
```

- Optional; omit or `""` when unknown  
- Persisted in `shelfieease_books_v1` with the rest of the book  
- `loadBooks` must tolerate books without the field (backward compatible)

### Lookup

- Extend `LookupResult` with optional `synopsis?: string`  
- Populate from EasyCB (`synopsis` key) when available  
- Google / Open Library: leave empty unless a clean field already exists (no scrape projects this pass)  
- On add-book paths (ISBN modal → `upsertBook`), copy `pendingData.synopsis` onto the new `Book`

### Existing library books

- No automatic re-fetch this pass  
- View shows empty-state synopsis  

---

## Technical touchpoints (expected)

| Area | File(s) |
|------|---------|
| Book type + load tolerance | `lib/storage.ts` |
| Lookup + EasyCB synopsis | `lib/lookup.ts` |
| Detail sheet view/edit UI | `app/library/page.tsx` (editing sheet block) |
| Optional design note | `design.md` (one short “detail sheet” bullet under live alignment) |

No new routes. Prefer minimal structural refactor; view/edit can be a boolean in the existing sheet.

---

## Success criteria

- Opening a book shows a **read-first** card; no title/author/ISBN inputs until Bewerken  
- New scans that EasyCB knows include a stored synopsis and show it in view  
- Books without synopsis still look calm  
- Demo limit, shelves, status/format pills, share card still work  
- Dutch UI strings for new chrome  

## Non-goals / anti-patterns

- Cards stacked inside the sheet for decoration  
- Forcing synopsis fetch on every open  
- Unlock/paywall changes  
- Purple/neon or feed-like chrome  
- E-reader patterns: page chrome, “Nu lezen” of full manuscript, font/reader settings, progress-% through a digital book  


---

## Follow-ups (later)

1. Lezen-hero atmosphere  
2. Ontdek/scan moment polish  
3. Optional “Opnieuw ophalen” for missing synopsis  
4. EasyCB cover proxy if covers remain sparse for NL ISBNs  
