/**
 * Node.js-specific decoding utilities for Firebase Functions
 * Uses zlib for decompression and imports shared decoding logic from src/encoding.ts
 */

import { gunzipSync } from 'zlib'
import type { AnimationData } from '../../src/encoding'
import { decodeV2, decodeV3, decodeV4 } from '../../src/encoding'

// Re-export type for convenience
export type { AnimationData }

/**
 * Decompresses base64-encoded gzip data using Node.js zlib
 */
const decompress = (compressedBase64: string): string => {
  const standardBase64 = restoreStandardBase64(compressedBase64)
  const compressed = Buffer.from(standardBase64, 'base64')
  const decompressed = gunzipSync(compressed)
  return decompressed.toString('utf-8')
}

const restoreStandardBase64 = (urlSafeBase64: string): string => {
  let restored = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/')
  while (restored.length % 4 !== 0) {
    restored += '='
  }
  return restored
}

/**
 * Decodes animation data from encoded string
 * Handles v2, v3, v4 formats with compression
 */
export const decodeAnimationData = (encodedData: string): AnimationData => {
  const versionDecoders: Record<string, (data: string) => AnimationData> = {
    'v2:': decodeV2,
    'v3:': decodeV3,
    'v4:': decodeV4,
  }

  for (const [prefix, decoder] of Object.entries(versionDecoders)) {
    if (encodedData.startsWith(prefix)) {
      const compressedData = encodedData.slice(prefix.length)
      const decompressedData = decompress(compressedData)
      return decoder(decompressedData)
    }
  }

  throw new Error('Invalid or unsupported encoding format')
}
