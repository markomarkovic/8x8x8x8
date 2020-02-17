<template>
  <div class="palette">
    <div
      v-for="(color, i) in palette"
      v-bind:key="i"
      class="color"
      v-bind:style="{ background: color }"
    ></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Palette',
  computed: mapState({
    palette: state => state.palette,
  }),
}
</script>

<style lang="scss">
.palette {
  margin: 2rem -1rem;

  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;

  .color {
    width: 5rem;
    height: 5rem;
    margin: 1rem;
    outline: 1rem solid transparent;
    background: #eee;

    &:hover,
    &.active {
      outline: 1rem solid #666;
    }
  }
}
</style>
