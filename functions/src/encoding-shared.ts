import { gunzipSync } from 'zlib'

export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type Frame = [
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
  ColorIndex,
]
export type Frames = [Frame, Frame, Frame, Frame, Frame, Frame, Frame, Frame]
export type Palette = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
]

export type AnimationData = {
  palette: Palette
  frames: Frames
}

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
 * Decodes palette from 48-char hex string
 */
const decodePalette = (paletteHex: string): Palette => {
  return Array(8)
    .fill(null)
    .map((_, i) => paletteHex.slice(i * 6, i * 6 + 6)) as Palette
}

/**
 * Decodes a single frame from 64-char hex string
 */
const decodeFrameFromHex = (frameHex: string): Frame => {
  return Array(64)
    .fill(null)
    .map((_, i) => parseInt(frameHex[i], 16) as ColorIndex) as Frame
}

/**
 * V2: Simple hex decoding (uncompressed)
 */
const decodeV2 = (hex: string): AnimationData => {
  const palette = decodePalette(hex.slice(0, 48))
  const frames = Array(8)
    .fill(null)
    .map((_, i) =>
      decodeFrameFromHex(hex.slice(48 + i * 64, 48 + (i + 1) * 64))
    ) as Frames

  return { palette, frames }
}

/**
 * V3: Delta encoding decoding
 */
const decodeV3 = (hex: string): AnimationData => {
  const palette = decodePalette(hex.slice(0, 48))
  const frame0 = decodeFrameFromHex(hex.slice(48, 112))

  const frames: Frame[] = [frame0]
  let offset = 112

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
 * V4: Run-length encoding decoding
 */
const decodeV4 = (hex: string): AnimationData => {
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

  // Pad to 64 pixels
  while (pixels.length < 64) {
    pixels.push(0 as ColorIndex)
  }

  return {
    frame: pixels.slice(0, 64) as Frame,
    bytesRead: currentOffset - offset,
  }
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
