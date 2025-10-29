# 8x8x8x8

A pixel art animation editor for creating 8×8 pixel animations with 8 frames and an 8-color palette.

## Features

- **8×8 pixel grid** for drawing
- **8 animation frames** with frame-by-frame editing
- **8-color palette** with customizable colors
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

Your animation is automatically encoded in the URL. Just copy and share the URL to share your animation!

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

## License

MIT
