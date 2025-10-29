import type { ColorIndex, Frame, Palette } from '../types'

type GridProps = {
  frame: Frame
  palette: Palette
  selectedColorIndex: ColorIndex
  onPixelClick: (pixelIndex: number) => void
}

export const Grid = ({ frame, palette, onPixelClick }: GridProps) => {
  return (
    <div class="grid">
      {frame.map((colorIndex, pixelIndex) => (
        <div
          key={pixelIndex}
          style={{ backgroundColor: `#${palette[colorIndex]}` }}
          onClick={() => onPixelClick(pixelIndex)}
        />
      ))}
    </div>
  )
}
