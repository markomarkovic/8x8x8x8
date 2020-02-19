<template>
  <div class="canvas">
    <div
      class="pixel"
      v-for="i in width * height"
      v-bind:key="i"
      v-bind:style="{ backgroundColor: colors[frame[i]] }"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Canvas',
  computed: mapState({
    width: state => state.app.width,
    height: state => state.app.height,
    colors: state => state.palette.colors,
    activeColorIndex: state => state.palette.activeIndex,
    frame: state => state.animation.frames[state.animation.activeIndex],
  }),
}
</script>

<style lang="scss">
.canvas {
  outline: 1px solid var(--system-color-black);
  display: grid;
  width: 100%;

  grid-template-columns: repeat(8, auto);

  .pixel {
    &::before {
      content: '';
      display: block;
      padding-top: 100%;
    }
  }
}
</style>
