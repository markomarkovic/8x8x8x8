import type { ColorIndex, Palette } from './types'

/**
 * Renders an 8x8 frame to a canvas context
 * @param ctx - Canvas 2D rendering context
 * @param frame - Array of 64 color indices
 * @param palette - Array of 8 colors (hex strings without #)
 * @param scale - Optional scale factor (default: 1). Each pixel will be scale×scale canvas pixels
 */
export const renderFrameToContext = (
  ctx: CanvasRenderingContext2D,
  frame: ColorIndex[],
  palette: Palette,
  scale: number = 1
) => {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const pixelIndex = y * 8 + x
      const colorIndex = frame[pixelIndex]
      ctx.fillStyle = `#${palette[colorIndex]}`
      ctx.fillRect(x * scale, y * scale, scale, scale)
    }
  }
}

/**
 * Renders an 8x8 frame to a canvas element
 * @param canvas - Canvas element to render to
 * @param frame - Array of 64 color indices
 * @param palette - Array of 8 colors (hex strings without #)
 * @param scale - Optional scale factor (default: 1). Canvas size will be (8×scale)×(8×scale)
 * @param willReadFrequently - Hint that canvas will be read frequently (for GIF encoding, etc.)
 */
export const renderFrameToCanvas = (
  canvas: HTMLCanvasElement,
  frame: ColorIndex[],
  palette: Palette,
  scale: number = 1,
  willReadFrequently: boolean = false
) => {
  const ctx = canvas.getContext('2d', { willReadFrequently })
  if (!ctx) return

  const size = 8 * scale
  canvas.width = size
  canvas.height = size

  renderFrameToContext(ctx, frame, palette, scale)
}
