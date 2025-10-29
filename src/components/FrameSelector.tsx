import { renderFrameToCanvas } from '../canvas'
import type { ColorIndex, Frames, Palette } from '../types'

type FrameSelectorProps = {
  frames: Frames
  palette: Palette
  currentFrameIndex: ColorIndex
  onFrameSelect: (index: ColorIndex) => void
}

export const FrameSelector = ({
  frames,
  palette,
  currentFrameIndex,
  onFrameSelect,
}: FrameSelectorProps) => {
  return (
    <div class="frame-selector">
      {frames.map((frame, index) => {
        const frameIndex = index as ColorIndex
        return (
          <div
            key={index}
            class={currentFrameIndex === frameIndex ? 'selected' : ''}
            onClick={() => onFrameSelect(frameIndex)}
          >
            <canvas
              ref={(canvas) => {
                if (canvas) renderFrameToCanvas(canvas, frame, palette)
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
