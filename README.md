# 8x8x8x8

A pixel art animation editor for creating 8×8 pixel animations with 8 frames and an 8-color palette.

## Features

- **8×8 pixel grid** for drawing with drag-to-paint support
- **8 animation frames** with frame-by-frame editing
- **8-color palette** with customizable colors
- **Advanced URL compression** - 70-90% reduction with smart format selection (see [ENCODING_FORMATS.md](ENCODING_FORMATS.md))
- **URL-based sharing** - entire animation encoded in URL hash
- **Animated preview** at 8 FPS
- **Animated favicon** that matches your creation
- **Single-file output** - no external dependencies
- **Public gallery** - submit your animations to a shared gallery (requires Firebase)
- **Google authentication** - sign in to submit animations
- **Submission queue** - track your submitted animations (up to 8 pending, unlimited approved/rejected)
- **Admin review** - approve or reject submissions (admin only)

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

### Gallery Submission

1. Sign in with your Google account (button in top-right corner)
2. Create your animation
3. Click the "Submit" button (appears below your queue when logged in)
4. Your submission appears in your queue with a yellow outline (pending)
5. Wait for admin approval
6. Once approved, your animation appears in the public gallery with a green outline in your queue

**Limits:** You can have up to 8 pending submissions at a time. Approved and rejected submissions are unlimited and appear in your queue below your pending slots.

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

### Firebase Functions

```bash
# Build functions
pnpm functions:build

# Deploy functions
pnpm functions:deploy

# View function logs
pnpm functions:logs

# Deploy everything (client + functions)
pnpm deploy
```

## Firebase Setup (Optional)

The gallery feature requires Firebase. The app works fully offline without it.

**Requirements:** Firebase Blaze plan (requires credit card, but expected cost is $0/month for typical usage)

- See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for step-by-step setup instructions
- See [COST_SAFETY.md](COST_SAFETY.md) for detailed cost analysis and budget protection

**Don't want to add a credit card?** Free alternatives available - see [COST_SAFETY.md](COST_SAFETY.md) for Cloudflare and Supabase options.

## Tech Stack

- **Preact** - Lightweight React alternative (3KB)
- **TypeScript** - Type safety
- **Vite** - Build tool with single-file output
- **Canvas API** - Rendering animations
- **Compression Streams API** - Gzip compression for URL optimization
- **Firebase** - Hosting, authentication, Firestore database, Cloud Functions

## Documentation

- [ENCODING_FORMATS.md](ENCODING_FORMATS.md) - Technical details on URL compression formats
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Step-by-step Firebase setup guide
- [COST_SAFETY.md](COST_SAFETY.md) - Firebase cost analysis and budget protection
- [AGENTS.md](AGENTS.md) - Instructions for AI agents working with this codebase

## Contributing

Want to become an admin and help moderate the gallery?

Admins are managed in the Firestore `admins` collection. To request admin access, open an issue with your Firebase UID (shown in browser console when you sign in). Project maintainers will add you to the Firestore `admins` collection.

## License

MIT
