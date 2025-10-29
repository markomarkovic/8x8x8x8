import type { AppState, ColorIndex, Frame, Frames, Palette } from './types'

/**
 * V3: Delta encoding - stores only differences between consecutive frames
 * Format: [palette][frame0][delta1][delta2]...[delta7]
 * Each delta contains only changed pixels as: position(6 bits) + colorIndex(3 bits)
 */
export const encodeV3 = (state: AppState): string => {
  const paletteHex = state.palette.join('')

  // First frame is stored completely
  const frame0Hex = state.frames[0]
    .map((colorIndex) => colorIndex.toString(16))
    .join('')

  // Subsequent frames store only deltas
  const deltas: string[] = []
  for (let frameIdx = 1; frameIdx < 8; frameIdx++) {
    const prevFrame = state.frames[frameIdx - 1]
    const currentFrame = state.frames[frameIdx]
    const delta: string[] = []

    for (let pixelIdx = 0; pixelIdx < 64; pixelIdx++) {
      if (currentFrame[pixelIdx] !== prevFrame[pixelIdx]) {
        // Encode position (0-63 = 6 bits) and color (0-7 = 3 bits) as 9-bit value
        // Store as 3 hex digits (12 bits, with 3 bits unused)
        const encoded = (pixelIdx << 3) | currentFrame[pixelIdx]
        delta.push(encoded.toString(16).padStart(3, '0'))
      }
    }

    // Store delta count (2 hex digits = 0-255) followed by delta data
    const deltaCount = Math.min(delta.length, 255)
    deltas.push(deltaCount.toString(16).padStart(2, '0') + delta.slice(0, 255).join(''))
  }

  return paletteHex + frame0Hex + deltas.join('')
}

/**
 * Decodes V3 delta-encoded format
 */
export const decodeV3 = (hex: string): AppState => {
  // Extract palette (48 chars)
  const paletteHex = hex.slice(0, 48)
  const palette: Palette = Array(8)
    .fill(null)
    .map((_, i) => paletteHex.slice(i * 6, i * 6 + 6)) as Palette

  // Extract first frame (64 chars)
  const frame0Hex = hex.slice(48, 48 + 64)
  const frame0: Frame = Array(64)
    .fill(null)
    .map((_, i) => parseInt(frame0Hex[i], 16) as ColorIndex) as Frame

  const frames: Frame[] = [frame0]
  let offset = 48 + 64

  // Decode 7 delta frames
  for (let frameIdx = 1; frameIdx < 8; frameIdx++) {
    // Copy previous frame
    const newFrame = [...frames[frameIdx - 1]] as Frame

    // Read delta count (2 hex chars)
    const deltaCount = parseInt(hex.slice(offset, offset + 2), 16)
    offset += 2

    // Apply deltas
    for (let i = 0; i < deltaCount; i++) {
      const encoded = parseInt(hex.slice(offset, offset + 3), 16)
      offset += 3

      const pixelIdx = encoded >> 3
      const colorIndex = (encoded & 0x7) as ColorIndex

      if (pixelIdx >= 0 && pixelIdx < 64) {
        newFrame[pixelIdx] = colorIndex
      }
    }

    frames.push(newFrame)
  }

  return {
    palette,
    frames: frames as Frames,
    selectedColorIndex: 0,
    currentFrameIndex: 0,
  }
}

/**
 * V4: Run-length encoding - encodes consecutive pixels of the same color
 * Format: [palette][rle_frames]
 * Each run: colorIndex(3 bits) + runLength(6 bits) as 9-bit value (3 hex digits)
 */
export const encodeV4 = (state: AppState): string => {
  const paletteHex = state.palette.join('')

  const rleFrames: string[] = []

  for (const frame of state.frames) {
    const runs: string[] = []
    let currentColor = frame[0]
    let runLength = 1

    for (let i = 1; i < 64; i++) {
      if (frame[i] === currentColor && runLength < 63) {
        runLength++
      } else {
        // Encode: colorIndex(3 bits) + runLength-1(6 bits) as 9-bit value
        const encoded = (currentColor << 6) | (runLength - 1)
        runs.push(encoded.toString(16).padStart(3, '0'))

        currentColor = frame[i]
        runLength = 1
      }
    }

    // Don't forget the last run
    const encoded = (currentColor << 6) | (runLength - 1)
    runs.push(encoded.toString(16).padStart(3, '0'))

    // Store run count (2 hex digits) followed by run data
    const runCount = Math.min(runs.length, 255)
    rleFrames.push(runCount.toString(16).padStart(2, '0') + runs.slice(0, 255).join(''))
  }

  return paletteHex + rleFrames.join('')
}

/**
 * Decodes V4 run-length encoded format
 */
export const decodeV4 = (hex: string): AppState => {
  // Extract palette (48 chars)
  const paletteHex = hex.slice(0, 48)
  const palette: Palette = Array(8)
    .fill(null)
    .map((_, i) => paletteHex.slice(i * 6, i * 6 + 6)) as Palette

  const frames: Frame[] = []
  let offset = 48

  // Decode 8 frames
  for (let frameIdx = 0; frameIdx < 8; frameIdx++) {
    const frame: ColorIndex[] = []

    // Read run count (2 hex chars)
    const runCount = parseInt(hex.slice(offset, offset + 2), 16)
    offset += 2

    // Decode runs
    for (let i = 0; i < runCount; i++) {
      const encoded = parseInt(hex.slice(offset, offset + 3), 16)
      offset += 3

      const colorIndex = ((encoded >> 6) & 0x7) as ColorIndex
      const runLength = (encoded & 0x3f) + 1

      for (let j = 0; j < runLength; j++) {
        frame.push(colorIndex)
      }
    }

    // Pad frame to 64 pixels if needed
    while (frame.length < 64) {
      frame.push(0 as ColorIndex)
    }

    frames.push(frame.slice(0, 64) as Frame)
  }

  return {
    palette,
    frames: frames as Frames,
    selectedColorIndex: 0,
    currentFrameIndex: 0,
  }
}

/**
 * Calculates the length of each encoding format and returns the shortest
 */
export const getBestEncoding = (
  state: AppState
): { version: 'v2' | 'v3' | 'v4'; data: string } => {
  // V2: Simple hex encoding
  const v2Data = encodeV2(state)

  // V3: Delta encoding
  const v3Data = encodeV3(state)

  // V4: Run-length encoding
  const v4Data = encodeV4(state)

  // Compare lengths and return shortest
  const options = [
    { version: 'v2' as const, data: v2Data, length: v2Data.length },
    { version: 'v3' as const, data: v3Data, length: v3Data.length },
    { version: 'v4' as const, data: v4Data, length: v4Data.length },
  ]

  options.sort((a, b) => a.length - b.length)

  return { version: options[0].version, data: options[0].data }
}

/**
 * V2: Simple hex encoding (uncompressed)
 */
const encodeV2 = (state: AppState): string => {
  const paletteHex = state.palette.join('')
  const framesHex = state.frames
    .map((frame) => frame.map((colorIndex) => colorIndex.toString(16)).join(''))
    .join('')
  return paletteHex + framesHex
}
