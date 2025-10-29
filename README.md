# 8x8x8x8

A pixel art animation editor for creating 8×8 pixel animations with 8 frames and an 8-color palette.

## Features

- **8×8 pixel grid** for drawing with drag-to-paint support
- **8 animation frames** with frame-by-frame editing
- **8-color palette** with customizable colors
- **Advanced URL compression** - 70-90% reduction with smart format selection
- **URL-based sharing** - entire animation encoded in URL hash
- **Animated preview** at 8 FPS
- **Animated favicon** that matches your creation
- **Single-file output** - no external dependencies

## How to Use

### Drawing

1. Click a color in the palette to select it
2. Click pixels in the grid to paint with the selected color
3. Switch between frames using the frame selector at the bottom

### Colors

- **Single click** on a palette color to select it for drawing
- **Double click** on a palette color to edit it using the color picker

### Sharing

Your animation is automatically encoded in the URL with intelligent compression. The app automatically selects the most efficient encoding format (v2, v3, or v4) based on your animation's characteristics, typically achieving 70-90% size reduction. Just copy and share the URL to share your animation!

See [ENCODING_FORMATS.md](ENCODING_FORMATS.md) for technical details on the compression formats.

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Format code
pnpm format
```

## Tech Stack

- **Preact** - Lightweight React alternative (3KB)
- **TypeScript** - Type safety
- **Vite** - Build tool with single-file output
- **Canvas API** - Rendering animations
- **Compression Streams API** - Gzip compression for URL optimization

## URL Compression

The app uses advanced compression techniques to minimize URL length:

- **3 encoding formats**: Plain hex (v2), Delta encoding (v3), Run-length encoding (v4)
- **Automatic selection**: Encodes with all formats and picks the shortest
- **Gzip compression**: All formats use gzip + URL-safe base64
- **Backward compatible**: Reads legacy uncompressed 560-char URLs

Typical compression results:

- Static frames: ~89% reduction
- Solid colors: ~87% reduction
- Gradual animations: ~79% reduction

## License

MIT
