# ShelfieEase — Design System (for Google Stitch & UI prompts)

> Use this file as the **product + visual brief** when prompting Stitch (or any UI generator).
> Last updated: 2026-07-23
> Related: `brand-brief.md` (voice & marketing) · live tokens in `app/layout.tsx`

---

## What ShelfieEase IS (read this first)

ShelfieEase is a **browser-based physical shelf tracker** for BoekTok / BookTok readers.

**Core loop:** Scan ISBN barcode → organize on custom shelves → track TBR / Reading / Finished → export a **9:16 shelfie card** for TikTok / Reels.

| Truth | Detail |
|-------|--------|
| Platform | Mobile web / PWA — **no App Store download** |
| Account | **Not required** to start |
| Data | **Local-first** (device / browser); optional JSON backup |
| Pricing | Free up to 10 books · €4.99 one-time unlimited |
| URL | https://www.shelfieease.app · scan: `/scan` |
| Language (UI + content) | **Dutch (NL)** by default |
| Tagline | Scan · Shelf · Share |

**One-line for Stitch:**  
*“A warm cream-and-berry mobile web app to scan physical books, organize your real bookshelf, and share a vertical shelfie — not a social network.”*

---

## What ShelfieEase is NOT

Do **not** generate these unless the user explicitly asks for a future concept:

- Social **feed** / BookTok community timeline  
- Followers, likes, comments, reviews network  
- Goodreads / StoryGraph clone (accounts, friends, discovery feed)  
- Mandatory login wall before scanning  
- Dark purple SaaS / neon “AI app” look  

**Wedge:** You don’t need another reading app with accounts and feeds. You need a tool for the books you **actually own**.

---

## Primary screens to generate

When Stitch asks for screens, prioritize this set (mobile, 390×844-ish):

1. **Scan** — camera / barcode ISBN scan, “al op je plank?” duplicate check  
2. **Mijn boeken / Library** — shelves with emoji + name, book cover grid  
3. **Boek detail** — cover, title, author, status (TBR / Reading / Finished), “Toevoegen aan plank”  
4. **Shelfie export** — vertical 9:16 share card ready for TikTok  
5. **Home / empty → first scan CTA** — zero friction, no signup wall  

Optional later (stats only, still **personal**, not social): reading goal, streak, simple “gelezen dit jaar” — **without** followers or public feed.

---

## Visual identity — “Modern Bookish Romance”

Warm paper / bookstore vibe. Romantic-playful, never corporate purple.

### Colors (light mode — default)

| Role | Hex | Use |
|------|-----|-----|
| Background | `#FBF3EA` | Page canvas |
| Background 2 | `#F7E9DE` | Soft depth |
| Panel | `#FFFDF9` / `#FDF6EE` | Cards, sheets |
| Border | `#E8D6C4` | Dividers, inputs |
| Text | `#4A1E2B` | Headings, body |
| Muted | `#7A4456` | Secondary labels |
| Primary / berry | `#7A2E42` | Primary buttons, key UI |
| Blush | `#E7B7C4` | Soft accents, chips |
| Butter | `#F4D35E` | Highlight spark (sparingly) |
| Lavender | `#C9A6D9` | Decorative only |
| On-primary | `#FFF8F2` | Text on berry buttons |

**Stitch swatches often shown as:** deep berry ≈ `#611421` / `#601A2E`, blush ≈ `#E5A1A1`, cream ≈ `#F6ECE1` — map those to the table above; prefer **live app hexes** when implementing.

### Dark mode (optional)

Navy/plum, never pure black: bg `#241726`, keep berry accents. Don’t default demos to dark.

### Typography

- **Display / book titles:** elegant **serif** (editorial, bookish)  
- **UI / body / buttons:** clean **sans-serif**  
- Hierarchy: large serif for “Mijn boeken”, book titles; sans for labels, metadata, CTAs  
- Tone: readable on cream; high contrast berry-on-cream for primary actions  

### Shape & components

- Buttons: pill / large radius (~20px), primary = solid berry + light text  
- Secondary: outline berry or soft cream fill  
- Cards: rounded, soft shadow (`rgba(74,30,43,0.14)`), cream panels  
- Search: rounded cream field, subtle border  
- Bottom nav (if used): Home · Scan · Library · Share/Shelfie — **not** Feed / Followers  
- Book covers: real cover art grids, bookshelf metaphor, emoji shelf names  

### Icon / mark

Three vertical book spines (berry / butter / lavender) + small star spark — warm, handmade-bookish, not flat SaaS glyph.

### Motion / demo feel

Soft, cozy, short transitions. Feels like flipping pages / sliding a book onto a shelf — not flashy tech demos.

---

## Copy rules for generated UI (NL)

- UI labels in **Dutch**  
- Address the user as **je**  
- Short, clear CTAs: `Scannen`, `Toevoegen aan plank`, `Deel shelfie`, `Probeer gratis`  
- Avoid: “Join the community”, “Follow readers”, “Post to feed”  
- Good microcopy: `Al op je plank?`, `TBR`, `Nu aan het lezen`, `Klaar voor TikTok`  

---

## Example Stitch prompt (paste + attach this file)

```
Use design.md as the source of truth for ShelfieEase.

Generate mobile UI screens for a browser PWA book shelf tracker:
- Scan ISBN, library with custom shelves, book detail, 9:16 shelfie share card
- Dutch UI copy
- Cream/berry Modern Bookish Romance palette from design.md
- NO social feed, NO followers, NO login wall
- Primary CTA: scan first book free at shelfieease.app
```

---

## Do / Don’t checklist for Stitch

| Do | Don’t |
|----|-------|
| Physical shelves, ISBN scan, TBR statuses | Social feed / community wall |
| Local shelf clarity + shelfie export | Account-required home |
| Cream + berry + blush | Purple neon SaaS |
| Serif titles + sans UI | Generic Inter-only landing look |
| Duplicate-check in bookstore moment | “Discover trending books” as core |

---

## Live app alignment (2026-07)

Route **1 — look only**. Community = TikTok/IG + NL-partners (geen in-app feed).

Shipped toward Stitch `*_shelf_tool` screens:
- Bottom nav: Mijn Plank · Lezen · Ontdek · Profiel
- Library: “Nu aan het lezen” hero + cover-forward 2-col grid
- Scan: Ontdek header + berry scan card
- Profiel/stats: personal counts, no followers
- No page-% progress in round 1
- Extra tokens: `--sage`, `--surface`, `--deepBurgundy`
- Book detail sheet: shelf-card view (synopsis blurb, no e-reader) · Bewerken for fields · synopsis stored at add from EasyCB
- Lezen hero: soft atmosphere, tap opens shelf card, empty state when nothing on Bezig
- Ontdek/scan: one scan moment + optional manual ISBN (no discovery-feed chrome)
- NL covers: EasyCB JPG via `/api/cover/cb` proxy when Google/OL miss
- Cover waterfall: EasyCB (+ VRK probe) → Open Library/IA → Google vid (size-checked) → Bol.com → OL title/author
- Google Books volumes API only used when `GOOGLE_BOOKS_API_KEY` is set (avoids 429 quota stalls)

Source export: `stitch_shelfieease_booktok_design_system.zip`

