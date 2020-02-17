<template>
  <div class="canvas">CANVAS {{ width }}x{{ height }}</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Canvas',
  computed: mapState({
    width: state => state.app.width,
    height: state => state.app.height,
  }),
}
</script>

<style lang="scss">
.canvas {
  background: #ebe;
  display: block;

  width: 100%;
}
</style>
