/**
 * Hex encoder for microcontroller firmware
 * Converts animation state to plain uncompressed hex string
 * Reuses existing encoding functions from encoding.ts
 */

import { encodeFrame } from './encoding'
import type { AppState } from './types'

/**
 * Encodes animation state to raw hex string for microcontroller use
 * Format: [palette:48chars][frames:512chars] = 560 total chars
 *
 * - Palette: 8 colors × 6 hex chars (RGB) = 48 chars
 * - Frames: 8 frames × 64 pixels × 1 hex char (color index 0-7) = 512 chars
 *
 * Example: FF0000FF7F00...
 */
export const encodeToHex = (state: AppState): string => {
  const paletteHex = state.palette.join('')
  const framesHex = state.frames.map(encodeFrame).join('')
  return paletteHex + framesHex
}

/**
 * Validates hex string format
 */
export const validateHex = (hex: string): boolean => {
  return hex.length === 560 && /^[0-9a-fA-F]+$/.test(hex)
}
