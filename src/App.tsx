import { useEffect, useState } from 'preact/hooks'
import { FrameSelector } from './components/FrameSelector'
import { Grid } from './components/Grid'
import { Palette } from './components/Palette'
import { Preview } from './components/Preview'
import {
  decodeState,
  getInitialState,
  getPendingDecodedState,
  updateURL,
} from './encoding'
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
    const mergeDecodedState = (newState: AppState | null) => {
      if (newState) {
        setState((prevState) => ({
          ...newState,
          selectedColorIndex: prevState.selectedColorIndex,
          currentFrameIndex: prevState.currentFrameIndex,
        }))
      }
    }

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        const decodedState = decodeState(hash)
        mergeDecodedState(decodedState)
      }
    }

    const handleStateDecompressed = () => {
      const pendingState = getPendingDecodedState()
      mergeDecodedState(pendingState)
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('statedecompressed', handleStateDecompressed)

    // Check if there's already a pending decompressed state from initial load
    const pendingState = getPendingDecodedState()
    if (pendingState) {
      setState(pendingState)
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('statedecompressed', handleStateDecompressed)
    }
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
