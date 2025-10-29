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

export const encodeState = (state: AppState): string => {
  const paletteHex = state.palette.join('')
  const framesHex = state.frames
    .map((frame) => frame.map((colorIndex) => colorIndex.toString(16)).join(''))
    .join('')
  return paletteHex + framesHex
}

export const decodeState = (hash: string): AppState => {
  if (!hash || hash.length !== 560) {
    return DEFAULT_STATE
  }

  try {
    // Extract palette (48 chars = 8 colors × 6 hex chars)
    const paletteHex = hash.slice(0, 48)
    const palette: Palette = Array(8)
      .fill(null)
      .map((_, i) => paletteHex.slice(i * 6, i * 6 + 6)) as Palette

    // Extract frames (512 chars = 8 frames × 64 pixels × 1 hex char)
    const framesHex = hash.slice(48)
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
  } catch {
    return DEFAULT_STATE
  }
}

export const getInitialState = (): AppState => {
  const hash = window.location.hash.slice(1)
  return decodeState(hash)
}

export const updateURL = (state: AppState): void => {
  const encoded = encodeState(state)
  window.location.hash = encoded
}
