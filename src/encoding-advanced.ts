import type { AppState, ColorIndex, Frame, Frames, Palette } from './types'

/**
 * V3: Delta encoding - stores only differences between consecutive frames
 * Format: [palette][frame0][delta1][delta2]...[delta7]
 * Each delta contains only changed pixels as: position(6 bits) + colorIndex(3 bits)
 */
export const encodeV3 = (state: AppState): string => {
  const paletteHex = state.palette.join('')
  const frame0Hex = encodeFrame(state.frames[0])
  const deltaHexStrings = encodeFrameDeltas(state.frames)

  return paletteHex + frame0Hex + deltaHexStrings
}

const encodeFrame = (frame: Frame): string => {
  return frame.map((colorIndex) => colorIndex.toString(16)).join('')
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

/**
 * Decodes V3 delta-encoded format
 */
export const decodeV3 = (hex: string): AppState => {
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

  return createAppState(palette, frames as Frames)
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
export const encodeV4 = (state: AppState): string => {
  const paletteHex = state.palette.join('')
  const rleFrames = state.frames.map(encodeFrameRLE)

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

/**
 * Decodes V4 run-length encoded format
 */
export const decodeV4 = (hex: string): AppState => {
  const palette = decodePalette(hex.slice(0, 48))
  const frames: Frame[] = []
  let offset = 48

  for (let frameIdx = 0; frameIdx < 8; frameIdx++) {
    const { frame, bytesRead } = decodeFrameRLE(hex, offset)
    frames.push(frame)
    offset += bytesRead
  }

  return createAppState(palette, frames as Frames)
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
  const framesHex = state.frames.map(encodeFrame).join('')
  return paletteHex + framesHex
}

/**
 * Shared helper functions
 */

const decodePalette = (paletteHex: string): Palette => {
  return Array(8)
    .fill(null)
    .map((_, i) => paletteHex.slice(i * 6, i * 6 + 6)) as Palette
}

const decodeFrameFromHex = (frameHex: string): Frame => {
  return Array(64)
    .fill(null)
    .map((_, i) => parseInt(frameHex[i], 16) as ColorIndex) as Frame
}

const createAppState = (palette: Palette, frames: Frames): AppState => {
  return {
    palette,
    frames,
    selectedColorIndex: 0,
    currentFrameIndex: 0,
  }
}
