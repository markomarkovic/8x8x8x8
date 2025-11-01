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
    const versionDecoders: Record<string, (data: string) => AppState> = {
      'v2:': decodeStateFromHex,
      'v3:': decodeV3,
      'v4:': decodeV4,
    }

    for (const [prefix, decoder] of Object.entries(versionDecoders)) {
      if (hash.startsWith(prefix)) {
        const compressedData = hash.slice(prefix.length)
        handleAsyncDecompression(compressedData, decoder)
        return null
      }
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

/**
 * Handles async decompression and state updates
 */
const handleAsyncDecompression = (
  compressedData: string,
  decoder: (data: string) => AppState
): void => {
  decompress(compressedData)
    .then((decompressedData) => {
      pendingDecodedState = decoder(decompressedData)
      window.dispatchEvent(new CustomEvent('statedecompressed'))
    })
    .catch(() => {
      pendingDecodedState = DEFAULT_STATE
      window.dispatchEvent(new CustomEvent('statedecompressed'))
    })
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
  const { version, data } = getBestEncoding(state)

  compress(data)
    .then((compressedData) => {
      const newHash = `${version}:${compressedData}`

      console.log(
        `Encoding: ${version}, uncompressed: ${data.length} chars, compressed: ${compressedData.length} chars`
      )

      if (window.location.hash !== `#${newHash}`) {
        window.location.hash = newHash
      }
    })
    .catch((error) => {
      console.error('Compression failed:', error)
      window.location.hash = encodeStateToHex(state)
    })
}
