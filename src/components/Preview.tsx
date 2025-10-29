import { useEffect, useRef } from 'preact/hooks'
import { renderFrameToContext } from '../canvas'
import type { Frames, Palette } from '../types'

type PreviewProps = {
  frames: Frames
  palette: Palette
}

export const Preview = ({ frames, palette }: PreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const frameIndexRef = useRef(0)
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get or reuse context
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d')
    }
    const ctx = ctxRef.current
    if (!ctx) return

    const fps = 8
    const frameDelay = 1000 / fps

    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= frameDelay) {
        frameIndexRef.current = (frameIndexRef.current + 1) % 8
        const currentFrame = frames[frameIndexRef.current]

        renderFrameToContext(ctx, currentFrame, palette)

        lastUpdateRef.current = timestamp
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [frames, palette])

  return (
    <div class="preview">
      <canvas ref={canvasRef} width={8} height={8} />
    </div>
  )
}
