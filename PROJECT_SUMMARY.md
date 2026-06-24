# CX Gallery - Project Summary

## Overview
A stunning Next.js photo gallery system for CX events, featuring photos from Adobe Lightroom shared galleries with a dark, minimal aesthetic.

## Stack
- **Next.js 16** (App Router + TypeScript)
- **Tailwind CSS 4**
- **pnpm** for package management
- **Adobe Lightroom API** for photo sourcing

## Architecture

### Gallery Configuration
Each event gallery is defined by a JSON file in `data/galleries/`:

```json
{
  "title": "6.19.26 CX",
  "subtitle": "by ALIZAYUH",
  "date": "June 19, 2026",
  "photographer": "ALIZAYUH",
  "lightroomShareId": "58f541bb4c484d64af1c9d909b653c22",
  "quotes": [
    { "text": "The best things happen when you stop expecting them to." },
    { "text": "Connection is the energy that exists between people.", "author": "Brené Brown" }
  ]
}
```

### Lightroom Scraper (`lib/lightroom.ts`)
Fetches photo data from Adobe Lightroom shared galleries:
- Handles the `while (1) {}` security prefix Adobe includes
- Fetches space metadata, album resources, and paginated assets
- Returns structured photo data with multiple resolution URLs (640px, 1280px, 2048px)
- Extracts Adobe's star ratings (converted to 0-100 score)
- Captures dimensions and capture dates

### Gallery Routes

#### Home Page (`/`)
- Lists all available galleries in a responsive grid
- Each gallery card shows:
  - Cover photo (highest-scoring landscape photo)
  - Title, subtitle, and date
  - Hover effects

#### Gallery Detail Page (`/gallery/[slug]`)
- Dynamic route with ISR (revalidate: 1 hour)
- Fetches photos from Lightroom API at build/request time
- Renders the Mosaic Gallery component

### Mosaic Gallery Component (`components/MosaicGallery.tsx`)
The centerpiece of the project:

#### Layout
- **Responsive masonry grid**: 3 columns on desktop, 2 on tablet, 1 on mobile
- **Variable photo sizes** based on:
  - **Score**: Photos with score ≥60 = large (span 2 columns), ≥55 = medium
  - **Orientation**: Landscape photos (width > height) span wider
- **Quote cards** interspersed every ~11 photos:
  - Full-width cards with large serif text (Cormorant Garamond)
  - Slightly lighter background (#111 on #000)
  - Optional author attribution

#### Features
- **Lazy loading**: Progressive image loading with IntersectionObserver
- **Entrance animations**: Fade-in as photos scroll into view
- **Lightbox**: Click any photo to open full-screen viewer
  - Arrow key navigation (←/→)
  - ESC to close
  - Shows photo counter (e.g., "3 / 24")
  - High-res images (2048px) in lightbox
- **Hover effects**: Subtle scale (1.02) on photo hover
- **Smart image loading**:
  - 640px thumbnails initially
  - 1280px on hover/interaction
  - 2048px in lightbox

#### Styling
- **Colors**: Full black (#000) background, white (#fff) text
- **Typography**: Inter (body), Cormorant Garamond (quotes)
- **Borders**: Subtle border-radius (4px) on photos
- **Quote cards**: Italic serif, warm text (#e8e8e8)
- **Smooth scroll behavior**

#### Header & Footer
- **Header**: Large title, subtitle, date, photographer credit
- **Footer**: Photographer attribution, "CX — BY INVITATION ONLY", link to original Lightroom gallery

## Configuration

### `next.config.ts`
Configured to allow images from Adobe domains:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'photos.adobe.io',
      pathname: '/v2/spaces/**',
    },
    {
      protocol: 'https',
      hostname: 'lightroom.adobe.com',
      pathname: '/**',
    },
  ],
}
```

### Fonts
- **Inter**: Primary sans-serif (loaded via next/font/google)
- **Cormorant Garamond**: Serif for quotes (loaded via next/font/google)

## First Gallery
Created `data/galleries/june-19-2026.json` with:
- Lightroom Share ID: `58f541bb4c484d64af1c9d909b653c22`
- 6 curated quotes about connection, nights, and community
- Ready to fetch and display photos

## Build & Deploy

### Development
```bash
pnpm dev
```

### Production Build
```bash
pnpm build
```

**Build Status**: ✅ Compiles successfully with no errors

### Start Production Server
```bash
pnpm start
```

## Key Files
- `lib/lightroom.ts` - Adobe Lightroom API scraper
- `lib/types.ts` - TypeScript interfaces for gallery config
- `components/MosaicGallery.tsx` - Main gallery component
- `app/page.tsx` - Home page (gallery index)
- `app/gallery/[slug]/page.tsx` - Dynamic gallery detail page
- `app/layout.tsx` - Root layout with fonts
- `app/globals.css` - Global styles
- `data/galleries/*.json` - Gallery configurations

## Design Philosophy
- **Dark & minimal**: CX-brand aesthetic (black, white, Inter)
- **Photo-first**: No unnecessary chrome or navigation
- **Smooth & polished**: Subtle animations, hover effects, transitions
- **Responsive**: Mobile-first, looks great on all devices
- **Performance**: ISR, lazy loading, progressive image sizes

## Adding New Galleries
1. Create a new JSON file in `data/galleries/` (e.g., `july-4-2026.json`)
2. Add title, date, photographer, Lightroom share ID, and quotes
3. Rebuild the site - it will auto-generate the new route
4. The gallery will appear on the home page automatically

## Technical Notes
- **ISR**: Gallery pages revalidate every hour (can be adjusted)
- **Static Generation**: Home page and gallery pages are pre-rendered at build time
- **API Calls**: Lightroom API is called at build/revalidate time (not client-side)
- **No authentication**: Uses public Lightroom share links
- **Pagination**: Lightroom scraper handles paginated results (100 photos per request)

---

**Status**: ✅ Built and verified. Ready for deployment and testing.
