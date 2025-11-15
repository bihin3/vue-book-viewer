# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rule

ユーザーからの応答は日本語で対応する

## Project Overview

Vue Book Viewer is a Vue 3 component library that provides a realistic book page-flipping animation. The project is built as a distributable npm package with TypeScript support and includes a demo application.

## Development Commands

```bash
# Start demo application dev server (runs on http://localhost:3000)
npm run dev

# Build the library for distribution
npm run build

# Build the demo application for GitHub Pages
npm run build:demo

# Preview the built demo
npm run preview:demo
```

## Architecture

### Dual Configuration Setup

The project has **two separate Vite configurations**:

1. **Library Build** (`vite.config.ts` in root)
   - Builds the distributable component library
   - Entry: `src/index.ts`
   - Output: `dist/` directory with UMD and ES modules
   - Exports: `BookFlip` component, `useBookFlip` composable, and types

2. **Demo Application** (`demo/vite.config.ts`)
   - Standalone demo app for development and GitHub Pages
   - Root: `./demo`
   - Output: `dist-demo/` directory
   - Base path: `/vue-book-viewer/` for GitHub Pages deployment

### Component Architecture

The book flip implementation uses a **dual-layer rendering approach**:

1. **Static Left Page** (`.page-left`)
   - Fixed position element showing the left-side content
   - Updates with a slight delay after flip animation completes
   - Uses `displayedLeftPage` ref to control which image is shown
   - Z-index: 1 (sits above flipped pages)

2. **Animated Right Pages** (`.page-right`)
   - Stack of flippable pages on the right side
   - Each page has `.front` (visible before flip) and `.back` (visible after flip)
   - Transform origin at left edge for rotation
   - Z-index decreases with page index (higher pages on top)
   - Flipped pages get `visibility: hidden` after animation completes

### Page Update Logic

**Critical timing behavior** in `src/components/BookFlip.vue`:

```typescript
// Updates at 90% of animation duration to prevent white flash
setTimeout(() => {
  displayedLeftPage.value = newPage;
}, config.duration * 0.9);
```

This ensures:
- The flipping page's back face is visible during animation
- Left page updates just before the flipped page disappears
- No white flash between transitions

### Page Data Structure

Pages are defined as pairs of front/back images:

```typescript
pages = [
  { front: 'page1.png', back: 'page2.png' },  // First flippable page
  { front: 'page3.png', back: 'page4.png' },  // Second flippable page
]
```

- `front`: Right side before flip (odd page numbers)
- `back`: Left side after flip (even page numbers)
- After flipping page[0], left shows page2.png, right shows page3.png

## Key Files

- `src/components/BookFlip.vue` - Main component with flip animation logic
- `src/composables/useBookFlip.ts` - Reusable page state management
- `src/types/index.ts` - TypeScript interfaces
- `demo/src/App.vue` - Demo application
- `demo/public/images/a4/` - Sample A4 images for demo

## GitHub Pages Deployment

The project auto-deploys to GitHub Pages via `.github/workflows/deploy.yml`:
- Triggers on push to `master` branch
- Builds demo with `npm run build:demo`
- Adds `.nojekyll` file to prevent Jekyll processing
- Deploys to `https://<username>.github.io/vue-book-viewer/`

## Build Output

**Library build** (`npm run build`):
- `dist/vue-book-viewer.es.js` - ES module
- `dist/vue-book-viewer.umd.js` - UMD module
- `dist/index.d.ts` - TypeScript declarations
- `dist/style.css` - Component styles

**Demo build** (`npm run build:demo`):
- `dist-demo/` - Static site for GitHub Pages
