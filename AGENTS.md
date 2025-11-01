# AGENTS.md

This file provides guidance to AI Agents when working with code in this repository.

## Project Overview

8x8x8x8 is a pixel art animation editor for creating 8×8 pixel animations with 8 frames and an 8-color palette. The entire application state is encoded in the URL hash, making animations shareable via links.

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production (TypeScript compilation + Vite build into single HTML file)
- `pnpm preview` - Preview production build
- `pnpm format` - Format code with Prettier
- `pnpm functions:build` - Build Cloud Functions
- `pnpm functions:deploy` - Deploy Cloud Functions
- `pnpm functions:logs` - View Cloud Function logs
- `pnpm deploy` - Deploy everything (client + functions)

## Architecture

### State Management & URL Encoding

The app uses **URL hash-based state persistence** with **intelligent compression** - all animation data is encoded in the URL with automatic format selection.

See [ENCODING_FORMATS.md](ENCODING_FORMATS.md) for complete technical documentation on the compression formats (v2/v3/v4/legacy).

#### Key Functions

In `encoding.ts`:

- `updateURL()` - Encodes state, tries all formats, picks shortest, compresses with gzip
- `decodeState()` - Detects format (v2/v3/v4/legacy) and decodes, async for compressed
- `getInitialState()` - Loads state from URL on page load
- `getPendingDecodedState()` - Retrieves async decompressed state

In `encoding-advanced.ts`:

- `encodeV3()` / `decodeV3()` - Delta encoding (frame differences)
- `encodeV4()` / `decodeV4()` - Run-length encoding (color runs)
- `getBestEncoding()` - Tries all formats, returns shortest

In `compression.ts`:

- `compress()` - Gzip compression + URL-safe base64
- `decompress()` - Base64 decode + gzip decompression

#### Async Decompression

Compressed URLs (v2/v3/v4) decompress asynchronously:

1. `decodeState()` returns `null` during decompression
2. Decompression completes → fires `statedecompressed` custom event
3. `App.tsx` listens for event and updates state
4. Handles race condition where decompression completes before listeners are set up

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

## URL Compression Strategy

When making changes that affect URL encoding:

1. **Test all format scenarios**:
   - Static frames (all identical) - should favor v3
   - Solid colors - should favor v4
   - High-frequency patterns - should favor v2
   - Gradual animations - should favor v3

2. **Maintain backward compatibility**:
   - Always support reading legacy 560-char uncompressed format
   - New formats must be additive (v5, v6, etc.)
   - Never break existing URLs

3. **Compression trade-offs**:
   - v3 (delta): 70-90% reduction for similar frames, but worse if frames differ significantly
   - v4 (RLE): 70-90% reduction for solid colors, but terrible for checkerboard patterns
   - v2 (plain): Baseline, always works reasonably well

4. **Console logging**: Check browser console to see which format was selected and compression stats

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
const frames = Array(8)
  .fill(null)
  .map(() => {
    const frame = createFrame()
    // Set pixel colors here: frame[y * 8 + x] = colorIndex
    return frame
  })

// Encode to URL hash
const hash =
  palette.join('') +
  frames.map((f) => f.map((c) => c.toString(16)).join('')).join('')

console.log('URL: http://localhost:5173/#' + hash)
```

## Implementation Notes

- **State immutability**: Always spread arrays when updating state to trigger re-renders
- **Type safety**: ColorIndex is a union type (0|1|2|3|4|5|6|7), not just `number`
- **Color format**: Hex colors stored WITHOUT '#' prefix, added only when rendering
- **Pixel coordinates**: `y * 8 + x` for row-major order (0-63)
- **Animation timing**: 8 FPS (125ms per frame) for retro feel
- **Async compression**: URL updates are async to avoid blocking UI - don't await them
- **Event-driven decompression**: Use `statedecompressed` custom event for async load completion
- **Format detection**: Check URL prefix (v2:/v3:/v4:) or length (560 = legacy) to determine format
