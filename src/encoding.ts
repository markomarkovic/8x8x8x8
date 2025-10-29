import { compress, decompress } from './compression'
import { decodeV3, decodeV4, getBestEncoding } from './encoding-advanced'
import type { AppState, ColorIndex, Frame, Frames, Palette } from './types'

const DEFAULT_PALETTE: Palette = [
  '000000', // 0x000 - black
  'ffffff', // 0xfff - white
  'bb0000', // 0xb00 - red
  '008800', // 0x080 - green
  '2244cc', // 0x24c - blue
  'eebb00', // 0xeb0 - yellow
  'bb5522', // 0xb52 - orange/brown
  '00cccc', // 0x0cc - cyan
]

const createEmptyFrame = (): Frame => Array(64).fill(0) as Frame

const DEFAULT_STATE: AppState = {
  palette: DEFAULT_PALETTE,
  frames: Array(8)
    .fill(null)
    .map(() => createEmptyFrame()) as Frames,
  selectedColorIndex: 0,
  currentFrameIndex: 0,
}

/**
 * Encodes state to uncompressed hex string
 */
const encodeStateToHex = (state: AppState): string => {
  const paletteHex = state.palette.join('')
  const framesHex = state.frames
    .map((frame) => frame.map((colorIndex) => colorIndex.toString(16)).join(''))
    .join('')
  return paletteHex + framesHex
}

/**
 * Decodes state from uncompressed hex string
 */
const decodeStateFromHex = (hex: string): AppState => {
  if (hex.length !== 560) {
    throw new Error('Invalid hex length')
  }

  // Extract palette (48 chars = 8 colors × 6 hex chars)
  const paletteHex = hex.slice(0, 48)
  const palette: Palette = Array(8)
    .fill(null)
    .map((_, i) => paletteHex.slice(i * 6, i * 6 + 6)) as Palette

  // Extract frames (512 chars = 8 frames × 64 pixels × 1 hex char)
  const framesHex = hex.slice(48)
  const frames: Frames = Array(8)
    .fill(null)
    .map((_, frameIdx) => {
      const frameStart = frameIdx * 64
      return Array(64)
        .fill(null)
        .map((_, pixelIdx) => {
          const hexChar = framesHex[frameStart + pixelIdx]
          const colorIndex = parseInt(hexChar, 16)
          return (
            colorIndex >= 0 && colorIndex <= 7 ? colorIndex : 0
          ) as ColorIndex
        }) as Frame
    }) as Frames

  return {
    palette,
    frames,
    selectedColorIndex: 0,
    currentFrameIndex: 0,
  }
}

/**
 * Decodes state from URL hash (handles all formats)
 * - v2: Compressed hex (gzip + base64)
 * - v3: Compressed delta encoding (gzip + base64)
 * - v4: Compressed run-length encoding (gzip + base64)
 * - Legacy: Uncompressed 560-char hex
 * @param hash The URL hash (without the # character)
 * @returns AppState or null if still decompressing
 */
export const decodeState = (hash: string): AppState | null => {
  if (!hash) {
    return DEFAULT_STATE
  }

  try {
    // V2: Compressed hex format
    if (hash.startsWith('v2:')) {
      const compressedData = hash.slice('v2:'.length)
      decompress(compressedData)
        .then((hex) => {
          const state = decodeStateFromHex(hex)
          pendingDecodedState = state
          window.dispatchEvent(new CustomEvent('statedecompressed'))
        })
        .catch(() => {
          pendingDecodedState = DEFAULT_STATE
          window.dispatchEvent(new CustomEvent('statedecompressed'))
        })
      return null
    }

    // V3: Compressed delta encoding
    if (hash.startsWith('v3:')) {
      const compressedData = hash.slice('v3:'.length)
      decompress(compressedData)
        .then((hex) => {
          const state = decodeV3(hex)
          pendingDecodedState = state
          window.dispatchEvent(new CustomEvent('statedecompressed'))
        })
        .catch(() => {
          pendingDecodedState = DEFAULT_STATE
          window.dispatchEvent(new CustomEvent('statedecompressed'))
        })
      return null
    }

    // V4: Compressed run-length encoding
    if (hash.startsWith('v4:')) {
      const compressedData = hash.slice('v4:'.length)
      decompress(compressedData)
        .then((hex) => {
          const state = decodeV4(hex)
          pendingDecodedState = state
          window.dispatchEvent(new CustomEvent('statedecompressed'))
        })
        .catch(() => {
          pendingDecodedState = DEFAULT_STATE
          window.dispatchEvent(new CustomEvent('statedecompressed'))
        })
      return null
    }

    // Legacy: Uncompressed format (backward compatibility)
    if (hash.length === 560) {
      return decodeStateFromHex(hash)
    }

    return DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

// Store for pending decoded state
let pendingDecodedState: AppState | null = null

/**
 * Gets the pending decoded state (used after async decompression)
 */
export const getPendingDecodedState = (): AppState | null => {
  const state = pendingDecodedState
  pendingDecodedState = null
  return state
}

/**
 * Gets initial state from URL hash
 */
export const getInitialState = (): AppState => {
  const hash = window.location.hash.slice(1)
  const state = decodeState(hash)
  return state ?? DEFAULT_STATE
}

/**
 * Updates URL hash with the best compressed format
 * Tries v2 (hex), v3 (delta), and v4 (RLE) and uses the shortest
 */
export const updateURL = (state: AppState): void => {
  // Get the best uncompressed encoding
  const { version, data } = getBestEncoding(state)

  // Compress and update URL asynchronously
  compress(data)
    .then((compressed) => {
      const newHash = `${version}:${compressed}`

      // Log encoding stats for debugging
      console.log(`Encoding: ${version}, uncompressed: ${data.length} chars, compressed: ${compressed.length} chars`)

      // Only update if hash has actually changed
      if (window.location.hash !== '#' + newHash) {
        window.location.hash = newHash
      }
    })
    .catch((error) => {
      console.error('Compression failed:', error)
      // Fallback to uncompressed v2
      const fallbackHex = encodeStateToHex(state)
      window.location.hash = fallbackHex
    })
}
