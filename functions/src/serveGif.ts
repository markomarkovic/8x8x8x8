import * as admin from 'firebase-admin'
import { onRequest } from 'firebase-functions/v2/https'
import { decodeAnimationData } from './encoding-shared'
import { generateGif } from './gifGenerator'

/**
 * Cloud Function to serve GIFs
 * URL format: /gifs/v3:abc123.gif
 * - Checks Firebase Storage for cached GIF
 * - Generates GIF if not found
 * - Stores in Firebase Storage for future requests
 * - Serves with aggressive cache headers (immutable)
 */
export const serveGif = onRequest(
  { cors: true, maxInstances: 10 },
  async (req, res) => {
    try {
      // Extract encoded data from path
      const path = req.path
      const match = path.match(/\/gifs\/(v\d+:.+)\.gif$/)

      if (!match) {
        res
          .status(400)
          .send('Invalid GIF path format. Expected: /gifs/v3:data.gif')
        return
      }

      const encodedData = match[1] // e.g., "v3:abc123xyz"
      const storagePath = `gifs/${encodedData}.gif`

      let gifBuffer: Buffer | undefined
      let cached = false

      // Try to get from storage (skip storage check in emulator to avoid issues)
      const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true'

      if (!isEmulator) {
        try {
          const bucket = admin.storage().bucket()
          const file = bucket.file(storagePath)
          const [exists] = await file.exists()

          if (exists) {
            console.log(`Serving cached GIF: ${storagePath}`)
            const [contents] = await file.download()
            gifBuffer = contents
            cached = true
          }
        } catch (storageError) {
          console.warn('Storage check failed, will generate GIF:', storageError)
        }
      }

      if (!cached) {
        // Generate new GIF
        console.log(`Generating new GIF: ${storagePath}`)

        try {
          const animationData = decodeAnimationData(encodedData)
          gifBuffer = generateGif(animationData)

          // Store in Firebase Storage for future requests (skip in emulator)
          if (!isEmulator) {
            try {
              const bucket = admin.storage().bucket()
              const file = bucket.file(storagePath)
              await file.save(gifBuffer, {
                metadata: {
                  contentType: 'image/gif',
                  cacheControl: 'public, max-age=31536000, immutable',
                },
              })
              console.log(`Stored GIF in cache: ${storagePath}`)
            } catch (storageError) {
              console.warn('Failed to store GIF in cache:', storageError)
              // Continue anyway, we can still serve the generated GIF
            }
          } else {
            console.log(
              'Emulator mode: skipping storage (serving generated GIF directly)'
            )
          }
        } catch (decodeError) {
          console.error('Failed to decode animation data:', decodeError)
          res.status(400).send('Invalid animation data encoding')
          return
        }
      }

      // Ensure we have a GIF buffer
      if (!gifBuffer) {
        res.status(500).send('Failed to generate GIF')
        return
      }

      // Set cache headers for browser/CDN caching
      res.set('Content-Type', 'image/gif')
      res.set('Cache-Control', 'public, max-age=31536000, immutable')
      res.set('ETag', `"${encodedData}"`)

      // Serve the GIF
      res.send(gifBuffer)
    } catch (error) {
      console.error('Error serving GIF:', error)
      res.status(500).send('Internal server error')
    }
  }
)
