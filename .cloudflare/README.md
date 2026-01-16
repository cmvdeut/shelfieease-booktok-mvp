# Cloudflare Pages Deployment

This project can be deployed to Cloudflare Pages using static export.

## Setup via Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > Pages
2. Click "Create a project" > "Connect to Git"
3. Select your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build:cf`
   - **Build output directory**: `out`
   - **Root directory**: (leave empty or set to `shelfieease-booktok-mvp` if in monorepo)
5. Click "Save and Deploy"

## Deploy via CLI

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Build the project:
   ```bash
   npm run build:cf
   ```

3. Deploy:
   ```bash
   wrangler pages deploy out
   ```

## How it works

- When `CF_PAGES=1` environment variable is set, Next.js builds a static export
- All pages are client-side rendered (`"use client"`), so static export works perfectly
- Output goes to `out/` directory which Cloudflare Pages serves

## Note

This uses static export, so all pages must be client-side rendered. Server-side features won't work, but this app is fully client-side so that's fine.

