<template>
  <div id="app">
    <Canvas />
    <Palette />
    <Frames />
  </div>
</template>

<script>
import '@/variables.css'
import Canvas from '@/components/Canvas'
import Frames from '@/components/Frames'
import Palette from '@/components/Palette'
export default {
  name: 'app',
  components: {
    Canvas,
    Frames,
    Palette,
  },
}
</script>

<style>
html {
  background: var(--system-color-gray);
  font-smooth: never;
  -webkit-font-smoothing: none;
  user-select: none;
  font-size: 11px;
  padding: 1rem;
}
</style>
