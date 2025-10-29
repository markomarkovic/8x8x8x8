import { useEffect, useState } from 'preact/hooks'
import { FrameSelector } from './components/FrameSelector'
import { Grid } from './components/Grid'
import { Palette } from './components/Palette'
import { Preview } from './components/Preview'
import { decodeState, getInitialState, updateURL } from './encoding'
import { startFaviconAnimation } from './favicon'
import type { AppState, ColorIndex, Palette as PaletteType } from './types'

export const App = () => {
  const [state, setState] = useState<AppState>(getInitialState)

  // Update URL when state changes
  useEffect(() => {
    updateURL(state)
  }, [state])

  // Update favicon animation when frames or palette change
  useEffect(() => {
    startFaviconAnimation(state.frames, state.palette)
  }, [state.frames, state.palette])

  // Listen for hash changes from external URL updates
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        const newState = decodeState(hash)
        // Preserve the current UI state (selected color and frame)
        setState((prevState) => ({
          ...newState,
          selectedColorIndex: prevState.selectedColorIndex,
          currentFrameIndex: prevState.currentFrameIndex,
        }))
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handlePixelClick = (pixelIndex: number) => {
    setState((prevState) => {
      const newFrames = [...prevState.frames]
      const newFrame = [...newFrames[prevState.currentFrameIndex]]
      newFrame[pixelIndex] = prevState.selectedColorIndex
      newFrames[prevState.currentFrameIndex] = newFrame
      return { ...prevState, frames: newFrames as typeof prevState.frames }
    })
  }

  const handleColorSelect = (index: ColorIndex) => {
    setState((prevState) => ({ ...prevState, selectedColorIndex: index }))
  }

  const handleColorChange = (index: ColorIndex, newColor: string) => {
    setState((prevState) => {
      const newPalette = [...prevState.palette] as PaletteType
      newPalette[index] = newColor
      return { ...prevState, palette: newPalette }
    })
  }

  const handleFrameSelect = (index: ColorIndex) => {
    setState((prevState) => ({ ...prevState, currentFrameIndex: index }))
  }

  return [
    <Grid
      frame={state.frames[state.currentFrameIndex]}
      palette={state.palette}
      selectedColorIndex={state.selectedColorIndex}
      onPixelClick={handlePixelClick}
    />,
    <Palette
      palette={state.palette}
      selectedColorIndex={state.selectedColorIndex}
      onColorSelect={handleColorSelect}
      onColorChange={handleColorChange}
    />,
    <FrameSelector
      frames={state.frames}
      palette={state.palette}
      currentFrameIndex={state.currentFrameIndex}
      onFrameSelect={handleFrameSelect}
    />,
    <Preview frames={state.frames} palette={state.palette} />,
  ]
}
