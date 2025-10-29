import { useRef } from 'preact/hooks'
import type { ColorIndex, Palette as PaletteType } from '../types'

type PaletteProps = {
  palette: PaletteType
  selectedColorIndex: ColorIndex
  onColorSelect: (index: ColorIndex) => void
  onColorChange: (index: ColorIndex, newColor: string) => void
}

export const Palette = ({
  palette,
  selectedColorIndex,
  onColorSelect,
  onColorChange,
}: PaletteProps) => {
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleColorInputChange = (index: ColorIndex, event: Event) => {
    const input = event.target as HTMLInputElement
    const hex = input.value.slice(1) // Remove '#' prefix
    onColorChange(index, hex)
  }

  const handleSwatchClick = (colorIndex: ColorIndex) => {
    onColorSelect(colorIndex)
  }

  const handleSwatchDoubleClick = (colorIndex: ColorIndex) => {
    // Trigger the hidden color picker
    colorInputRefs.current[colorIndex]?.click()
  }

  return (
    <div class="palette">
      {palette.map((color, index) => {
        const colorIndex = index as ColorIndex
        return (
          <div
            key={index}
            class={selectedColorIndex === colorIndex ? 'selected' : ''}
            style={{ backgroundColor: `#${color}` }}
            onClick={() => handleSwatchClick(colorIndex)}
            onDblClick={() => handleSwatchDoubleClick(colorIndex)}
          >
            <input
              ref={(el) => {
                colorInputRefs.current[colorIndex] = el
              }}
              type="color"
              value={`#${color}`}
              onChange={(e) => handleColorInputChange(colorIndex, e)}
            />
          </div>
        )
      })}
    </div>
  )
}
