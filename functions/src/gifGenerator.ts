// @ts-ignore - gifenc doesn't have TypeScript definitions
import { applyPalette, GIFEncoder, quantize } from 'gifenc'
import type { AnimationData } from './decoding'

/**
 * Converts hex color string to RGB array
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return [r, g, b]
}

/**
 * Generates a GIF from animation data
 * Converts indexed pixels to RGBA format for gifenc
 * @param animationData The decoded animation data
 * @param width Width of the GIF in pixels (default 8)
 * @param height Height of the GIF in pixels (default 8)
 * @param frameDelay Delay between frames in milliseconds (default 125ms = 8 FPS)
 * @returns GIF as Buffer
 */
export const generateGif = (
  animationData: AnimationData,
  width = 8,
  height = 8,
  frameDelay = 125
): Buffer => {
  // Convert palette from hex strings to RGB arrays
  const rgbPalette = animationData.palette.map(hexToRgb)

  // Create GIF encoder
  const gif = GIFEncoder()

  // Process each frame
  for (const frame of animationData.frames) {
    // Convert indexed pixels to RGBA format (4 bytes per pixel)
    const rgbaData = new Uint8Array(width * height * 4)

    for (let i = 0; i < frame.length; i++) {
      const colorIndex = frame[i]
      const [r, g, b] = rgbPalette[colorIndex]
      const offset = i * 4

      rgbaData[offset] = r
      rgbaData[offset + 1] = g
      rgbaData[offset + 2] = b
      rgbaData[offset + 3] = 255 // Alpha (fully opaque)
    }

    // Use quantize to create an optimal palette for this frame
    // (though we could optimize by reusing our palette)
    const palette = quantize(rgbaData, 256)
    const indexedPixels = applyPalette(rgbaData, palette)

    gif.writeFrame(indexedPixels, width, height, {
      palette,
      delay: frameDelay,
    })
  }

  gif.finish()

  return Buffer.from(gif.bytes())
}
