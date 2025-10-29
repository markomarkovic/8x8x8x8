import { renderFrameToCanvas } from './canvas'
import type { Frames, Palette } from './types'

let currentFrameIndex = 0
let animationFrameId: number | null = null
let lastUpdate = 0

const updateFavicon = (canvas: HTMLCanvasElement) => {
  const link = document.querySelector(
    "link[rel*='icon']"
  ) as HTMLLinkElement | null
  if (link) {
    link.href = canvas.toDataURL()
  } else {
    const newLink = document.createElement('link')
    newLink.rel = 'icon'
    newLink.href = canvas.toDataURL()
    document.head.appendChild(newLink)
  }
}

export const startFaviconAnimation = (frames: Frames, palette: Palette) => {
  const canvas = document.createElement('canvas')
  const fps = 8
  const frameDelay = 1000 / fps

  const animate = (timestamp: number) => {
    if (timestamp - lastUpdate >= frameDelay) {
      currentFrameIndex = (currentFrameIndex + 1) % 8
      const currentFrame = frames[currentFrameIndex]
      renderFrameToCanvas(canvas, currentFrame, palette, 2)
      updateFavicon(canvas)
      lastUpdate = timestamp
    }
    animationFrameId = requestAnimationFrame(animate)
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  animationFrameId = requestAnimationFrame(animate)
}

export const stopFaviconAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}
