# CX Gallery - Quick Start

## Location
```
/tmp/cx-gallery
```

## Install Dependencies (if needed)
```bash
cd /tmp/cx-gallery
pnpm install
```

## Development
```bash
pnpm dev
```
Then open http://localhost:3000

## Production Build
```bash
pnpm build
pnpm start
```

## Project Features

### Home Page (/)
- Lists all gallery events
- Beautiful grid layout with cover photos
- Click any gallery to view full collection

### Gallery Detail (/gallery/june-19-2026)
- Stunning masonry layout with 3 columns (responsive)
- Photos sized by importance (score-based)
- Quote cards interspersed throughout
- Click any photo to open lightbox
- Arrow keys to navigate, ESC to close

### Lightroom Integration
Photos are fetched from Adobe Lightroom shared galleries at build time. The first gallery uses share ID `58f541bb4c484d64af1c9d909b653c22`.

### Adding More Galleries
1. Create a new JSON file in `data/galleries/` (e.g., `july-4-2026.json`)
2. Copy the structure from `june-19-2026.json`
3. Update: title, date, photographer, lightroomShareId, quotes
4. Rebuild the site with `pnpm build`
5. The new gallery will appear automatically!

## Tech Stack
- Next.js 16 (App Router + TypeScript)
- Tailwind CSS 4
- Adobe Lightroom API
- Inter & Cormorant Garamond fonts

## Documentation
- `PROJECT_SUMMARY.md` - Full project documentation
- `BUILD_VERIFICATION.md` - Build verification checklist

---

**Status**: ✅ Ready to run and test
