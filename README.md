# 8×8×8×8

A pixel art animation editor for creating 8×8 pixel animations with 8 frames and an 8-color palette.

## 🎨 [Try it live!](https://eightxeightxeightxeight.web.app)

<a href="https://eightxeightxeightxeight.web.app/#v3:H4sIAAAAAAAAAzWP2xXFIAgEWxrEPChHQfov4RKTuz8Ie1jGdaZmTg3LvJn56HbIjItPxlqGi41z_mfy6exv7Ye-vX71759t6_rEzW1Yx0_ciYOYgonMcqxejhvRiWDtqKYFYMaomRDOOliTLAST9qwNYZZZmEIepEsTUX0cp4iXsoLsZC2oqDCoz1XgMOp6zJ3pZJ2b0uoc10ap5NCN0lkFqZX8AzUzNF8yAQAA">
  <img src="https://eightxeightxeightxeight.web.app/gifs/v3:H4sIAAAAAAAAAzWP2xXFIAgEWxrEPChHQfov4RKTuz8Ie1jGdaZmTg3LvJn56HbIjItPxlqGi41z_mfy6exv7Ye-vX71759t6_rEzW1Yx0_ciYOYgonMcqxejhvRiWDtqKYFYMaomRDOOliTLAST9qwNYZZZmEIepEsTUX0cp4iXsoLsZC2oqDCoz1XgMOp6zJ3pZJ2b0uoc10ap5NCN0lkFqZX8AzUzNF8yAQAA.gif" alt="A fish in a tank" width="64" style="image-rendering: pixelated; image-rendering: crisp-edges;">
</a>

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
