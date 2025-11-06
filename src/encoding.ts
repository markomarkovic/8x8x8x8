/**
 * Complete encoding/decoding system for animation data
 * Supports v2 (hex), v3 (delta), v4 (RLE) formats with compression
 * Shared between frontend and backend (Node.js functions)
 */

import { compress, decompress } from './compression'
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
 * Core encoding/decoding types for backend compatibility
 */
export type AnimationData = {
  palette: Palette
  frames: Frames
}

/**
 * Shared helper functions
 */

export const decodePalette = (paletteHex: string): Palette => {
  return Array(8)
    .fill(null)
    .map((_, i) => paletteHex.slice(i * 6, i * 6 + 6)) as Palette
}

export const decodeFrameFromHex = (frameHex: string): Frame => {
  return Array(64)
    .fill(null)
    .map((_, i) => parseInt(frameHex[i], 16) as ColorIndex) as Frame
}

export const encodeFrame = (frame: Frame): string => {
  return frame.map((colorIndex) => colorIndex.toString(16)).join('')
}

/**
 * V2: Simple hex encoding (uncompressed)
 * Format: [palette][frame0][frame1]...[frame7]
 */
const encodeV2 = (palette: Palette, frames: Frames): string => {
  const paletteHex = palette.join('')
  const framesHex = frames.map(encodeFrame).join('')
  return paletteHex + framesHex
}

export const decodeV2 = (hex: string): AnimationData => {
  const palette = decodePalette(hex.slice(0, 48))
  const frames = Array(8)
    .fill(null)
    .map((_, i) =>
      decodeFrameFromHex(hex.slice(48 + i * 64, 48 + (i + 1) * 64))
    ) as Frames

  return { palette, frames }
}

/**
 * Encodes state to uncompressed hex string (for legacy compatibility)
 */
const encodeStateToHex = (state: AppState): string => {
  return encodeV2(state.palette, state.frames)
}

/**
 * Decodes state from uncompressed hex string (for legacy compatibility)
 */
const decodeStateFromHex = (hex: string): AppState => {
  if (hex.length !== 560) {
    throw new Error('Invalid hex length')
  }

  const animationData = decodeV2(hex)
  return {
    ...animationData,
    selectedColorIndex: 0,
    currentFrameIndex: 0,
  }
}

/**
 * V3: Delta encoding - stores only differences between consecutive frames
 * Format: [palette][frame0][delta1][delta2]...[delta7]
 * Each delta contains only changed pixels as: position(6 bits) + colorIndex(3 bits)
 */
const encodeV3Core = (palette: Palette, frames: Frames): string => {
  const paletteHex = palette.join('')
  const frame0Hex = encodeFrame(frames[0])
  const deltaHexStrings = encodeFrameDeltas(frames)

  return paletteHex + frame0Hex + deltaHexStrings
}

const encodeFrameDeltas = (frames: Frames): string => {
  const deltas: string[] = []

  for (let frameIdx = 1; frameIdx < frames.length; frameIdx++) {
    const prevFrame = frames[frameIdx - 1]
    const currentFrame = frames[frameIdx]
    const deltaEntries = encodeSingleFrameDelta(prevFrame, currentFrame)

    const deltaCount = Math.min(deltaEntries.length, 255)
    const deltaCountHex = deltaCount.toString(16).padStart(2, '0')
    const deltaData = deltaEntries.slice(0, 255).join('')

    deltas.push(deltaCountHex + deltaData)
  }

  return deltas.join('')
}

const encodeSingleFrameDelta = (
  prevFrame: Frame,
  currentFrame: Frame
): string[] => {
  const deltaEntries: string[] = []

  for (let pixelIdx = 0; pixelIdx < 64; pixelIdx++) {
    if (currentFrame[pixelIdx] !== prevFrame[pixelIdx]) {
      // Encode position (0-63 = 6 bits) and color (0-7 = 3 bits) as 9-bit value
      const encoded = (pixelIdx << 3) | currentFrame[pixelIdx]
      deltaEntries.push(encoded.toString(16).padStart(3, '0'))
    }
  }

  return deltaEntries
}

export const decodeV3 = (hex: string): AnimationData => {
  const palette = decodePalette(hex.slice(0, 48))
  const frame0 = decodeFrameFromHex(hex.slice(48, 112))

  const frames: Frame[] = [frame0]
  let offset = 112 // After palette (48) + frame0 (64)

  for (let frameIdx = 1; frameIdx < 8; frameIdx++) {
    const { frame: newFrame, bytesRead } = decodeFrameWithDelta(
      hex,
      offset,
      frames[frameIdx - 1]
    )
    frames.push(newFrame)
    offset += bytesRead
  }

  return { palette, frames: frames as Frames }
}

const decodeFrameWithDelta = (
  hex: string,
  offset: number,
  prevFrame: Frame
): { frame: Frame; bytesRead: number } => {
  const newFrame = [...prevFrame] as Frame
  const deltaCount = parseInt(hex.slice(offset, offset + 2), 16)
  let currentOffset = offset + 2

  for (let i = 0; i < deltaCount; i++) {
    const encoded = parseInt(hex.slice(currentOffset, currentOffset + 3), 16)
    currentOffset += 3

    const pixelIdx = encoded >> 3
    const colorIndex = (encoded & 0x7) as ColorIndex

    if (pixelIdx >= 0 && pixelIdx < 64) {
      newFrame[pixelIdx] = colorIndex
    }
  }

  return { frame: newFrame, bytesRead: currentOffset - offset }
}

/**
 * V4: Run-length encoding - encodes consecutive pixels of the same color
 * Format: [palette][rle_frames]
 * Each run: colorIndex(3 bits) + runLength(6 bits) as 9-bit value (3 hex digits)
 */
const encodeV4Core = (palette: Palette, frames: Frames): string => {
  const paletteHex = palette.join('')
  const rleFrames = frames.map(encodeFrameRLE)

  return paletteHex + rleFrames.join('')
}

const encodeFrameRLE = (frame: Frame): string => {
  const runs = encodeRunsForFrame(frame)
  const runCount = Math.min(runs.length, 255)
  const runCountHex = runCount.toString(16).padStart(2, '0')
  const runData = runs.slice(0, 255).join('')

  return runCountHex + runData
}

const encodeRunsForFrame = (frame: Frame): string[] => {
  const runs: string[] = []
  let currentColor = frame[0]
  let runLength = 1

  for (let i = 1; i < 64; i++) {
    if (frame[i] === currentColor && runLength < 63) {
      runLength++
    } else {
      runs.push(encodeRun(currentColor, runLength))
      currentColor = frame[i]
      runLength = 1
    }
  }

  runs.push(encodeRun(currentColor, runLength))

  return runs
}

const encodeRun = (colorIndex: ColorIndex, runLength: number): string => {
  const encoded = (colorIndex << 6) | (runLength - 1)
  return encoded.toString(16).padStart(3, '0')
}

export const decodeV4 = (hex: string): AnimationData => {
  const palette = decodePalette(hex.slice(0, 48))
  const frames: Frame[] = []
  let offset = 48

  for (let frameIdx = 0; frameIdx < 8; frameIdx++) {
    const { frame, bytesRead } = decodeFrameRLE(hex, offset)
    frames.push(frame)
    offset += bytesRead
  }

  return { palette, frames: frames as Frames }
}

const decodeFrameRLE = (
  hex: string,
  offset: number
): { frame: Frame; bytesRead: number } => {
  const pixels: ColorIndex[] = []
  const runCount = parseInt(hex.slice(offset, offset + 2), 16)
  let currentOffset = offset + 2

  for (let i = 0; i < runCount; i++) {
    const encoded = parseInt(hex.slice(currentOffset, currentOffset + 3), 16)
    currentOffset += 3

    const colorIndex = ((encoded >> 6) & 0x7) as ColorIndex
    const runLength = (encoded & 0x3f) + 1

    for (let j = 0; j < runLength; j++) {
      pixels.push(colorIndex)
    }
  }

  // Pad to 64 pixels and truncate excess
  while (pixels.length < 64) {
    pixels.push(0 as ColorIndex)
  }

  return {
    frame: pixels.slice(0, 64) as Frame,
    bytesRead: currentOffset - offset,
  }
}

/**
 * Calculates the length of each encoding format and returns the shortest
 */
export const getBestEncoding = (
  state: AppState
): { version: 'v2' | 'v3' | 'v4'; data: string } => {
  const v2Data = encodeV2(state.palette, state.frames)
  const v3Data = encodeV3Core(state.palette, state.frames)
  const v4Data = encodeV4Core(state.palette, state.frames)

  const options = [
    { version: 'v2' as const, data: v2Data, length: v2Data.length },
    { version: 'v3' as const, data: v3Data, length: v3Data.length },
    { version: 'v4' as const, data: v4Data, length: v4Data.length },
  ]

  options.sort((a, b) => a.length - b.length)

  return { version: options[0].version, data: options[0].data }
}

/**
 * AppState-specific decoder wrappers (convert AnimationData to AppState)
 */
const decodeV3State = (hex: string): AppState => {
  const animationData = decodeV3(hex)
  return {
    ...animationData,
    selectedColorIndex: 0,
    currentFrameIndex: 0,
  }
}

const decodeV4State = (hex: string): AppState => {
  const animationData = decodeV4(hex)
  return {
    ...animationData,
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
      'v3:': decodeV3State,
      'v4:': decodeV4State,
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
