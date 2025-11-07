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
  const longPressTimerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)

  const handleColorInputChange = (index: ColorIndex, event: Event) => {
    const input = event.target as HTMLInputElement
    const hex = input.value.slice(1) // Remove '#' prefix
    onColorChange(index, hex)
  }

  const openColorPicker = (colorIndex: ColorIndex) => {
    colorInputRefs.current[colorIndex]?.click()
  }

  const handleSwatchClick = (colorIndex: ColorIndex) => {
    // Don't select color if long-press was triggered
    if (!longPressTriggeredRef.current) {
      onColorSelect(colorIndex)
    }
    longPressTriggeredRef.current = false
  }

  const handleSwatchDoubleClick = (colorIndex: ColorIndex) => {
    openColorPicker(colorIndex)
  }

  const handleTouchStart = (colorIndex: ColorIndex) => {
    longPressTriggeredRef.current = false
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      openColorPicker(colorIndex)
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500) // 500ms long-press
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
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
            onTouchStart={() => handleTouchStart(colorIndex)}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
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
