# AGENTS.md

This file provides guidance to AI Agents when working with code in this repository.

## Project Overview

8x8x8x8 is a pixel art animation editor for creating 8×8 pixel animations with 8 frames and an 8-color palette. The entire application state is encoded in the URL hash, making animations shareable via links.

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production (TypeScript compilation + Vite build into single HTML file)
- `pnpm preview` - Preview production build
- `pnpm format` - Format code with Prettier

## Architecture

### State Management & URL Encoding

The app uses **URL hash-based state persistence** - all animation data is encoded in the URL:

- **Structure**: `#[48 hex chars: palette][512 hex chars: frames]`
- **Palette**: 8 colors × 6 hex digits each (e.g., `FF0000`)
- **Frames**: 8 frames × 64 pixels × 1 hex digit (color index 0-7)
- **Total**: 560 characters

Key functions in `encoding.ts`:

- `encodeState()` - Serializes AppState to URL hash
- `decodeState()` - Deserializes URL hash to AppState
- `updateURL()` - Updates browser URL hash whenever state changes
- State automatically syncs on hash change for sharing/bookmarking

### Core Type System

Defined in `types.ts`:

```typescript
type Color = string // 6-char hex without '#'
type Palette = [Color × 8] // Exactly 8 colors
type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 // Strict union type
type Frame = ColorIndex[] // 64 pixels (8×8 grid)
type Frames = [Frame × 8] // Exactly 8 frames
```

This strict typing ensures:

- Palette always has 8 colors
- ColorIndex values are validated at compile time
- Frames and Frames arrays have fixed lengths

### Component Architecture

The app renders 4 main components **directly as an array** (no wrapper div) into `#app` which is a CSS Grid:

```
┌─────────────┬──────────────┐
│ Grid (8×8)  │ Palette (8)  │  ← Row 1
├─────────────┼──────────────┤
│ FrameSelect │ Preview (1)  │  ← Row 2
│    (8)      │   (50×50)    │
└─────────────┴──────────────┘
```

**Key pattern**: Components use CSS child selectors instead of class names on children:

- `.grid > div` instead of `.pixel`
- `.palette > div` instead of `.palette-color`
- `.frame-selector > div` instead of `.frame-thumbnail`

### Canvas Rendering

Shared utilities in `canvas.ts`:

- `renderFrameToContext(ctx, frame, palette, scale)` - Renders to existing 2D context
- `renderFrameToCanvas(canvas, frame, palette, scale, willReadFrequently)` - Handles canvas setup + rendering

**Used by**:

- `Preview.tsx` - Animates at 8 FPS using `requestAnimationFrame`
- `FrameSelector.tsx` - Renders static thumbnails of each frame
- `favicon.ts` - Renders animated favicon at scale=2 (16×16px)

The `willReadFrequently` parameter should be `true` when canvas will be read via `getImageData()` to avoid browser warnings.

### Preact-Specific

Built with **Preact** (React alternative, 3KB):

- Uses `h` and `Fragment` from Preact (auto-injected via Vite config)
- Returns component arrays directly: `return [<Grid />, <Palette />, ...]`
- Standard hooks: `useState`, `useEffect`, `useRef`

### CSS Architecture

Single global CSS file (`style.css`):

- **No CSS modules or styled-components**
- Uses `image-rendering: pixelated` for clean pixel scaling
- Grid layout with `gap: 50px` (matches one pixel size)
- All measurements in pixels (8×8 grid at 50px per cell = 400×400px)
- Outline-based selection indicators (not borders) to avoid size changes

### Build Output

Uses `vite-plugin-singlefile` to bundle everything into a **single HTML file** (~20KB):

- All CSS inlined
- All JS inlined
- No external dependencies at runtime
- Easy to share/host anywhere

## Default State

The application starts with:
- **Empty frames**: All 8 frames filled with black pixels (color index 0)
- **Default palette**: Basic colors (black, white, red, green, blue, yellow, magenta, cyan)
- **Selected color**: Index 0 (black)
- **Current frame**: Frame 0

## Creating Animations

To generate custom animation URLs programmatically:

```javascript
// Example: Create a simple animation
const palette = [
  '000000', // black
  'FFFFFF', // white
  'FF0000', // red
  '00FF00', // green
  '0000FF', // blue
  'FFFF00', // yellow
  'FF00FF', // magenta
  '00FFFF', // cyan
]

// Helper to create a frame
const createFrame = () => Array(64).fill(0) // 64 pixels, all black

// Create 8 frames with custom pixel data
const frames = Array(8).fill(null).map(() => {
  const frame = createFrame()
  // Set pixel colors here: frame[y * 8 + x] = colorIndex
  return frame
})

// Encode to URL hash
const hash = palette.join('') + frames.map(f =>
  f.map(c => c.toString(16)).join('')
).join('')

console.log('URL: http://localhost:5173/#' + hash)
```

## Implementation Notes

- **State immutability**: Always spread arrays when updating state to trigger re-renders
- **Type safety**: ColorIndex is a union type (0|1|2|3|4|5|6|7), not just `number`
- **Color format**: Hex colors stored WITHOUT '#' prefix, added only when rendering
- **Pixel coordinates**: `y * 8 + x` for row-major order (0-63)
- **Animation timing**: 8 FPS (125ms per frame) for retro feel
