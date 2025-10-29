import { useEffect, useState } from 'preact/hooks'
import type { ColorIndex, Frame, Palette } from '../types'

type GridProps = {
  frame: Frame
  palette: Palette
  selectedColorIndex: ColorIndex
  onPixelClick: (pixelIndex: number) => void
}

export const Grid = ({ frame, palette, onPixelClick }: GridProps) => {
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp)
      return () => document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const handleMouseDown = (pixelIndex: number) => {
    setIsDragging(true)
    onPixelClick(pixelIndex)
  }

  const handleMouseEnter = (pixelIndex: number) => {
    if (isDragging) {
      onPixelClick(pixelIndex)
    }
  }

  return (
    <div class="grid">
      {frame.map((colorIndex, pixelIndex) => (
        <div
          key={pixelIndex}
          style={{ backgroundColor: `#${palette[colorIndex]}` }}
          onMouseDown={() => handleMouseDown(pixelIndex)}
          onMouseEnter={() => handleMouseEnter(pixelIndex)}
        />
      ))}
    </div>
  )
}
