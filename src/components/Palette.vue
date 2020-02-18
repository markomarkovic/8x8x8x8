<template>
  <div class="palette">
    <div
      class="color"
      v-for="(color, i) in palette"
      v-bind:key="i"
      v-bind:class="{ active: activeIndex === i }"
      v-bind:style="{ background: color }"
      v-on:click="setActiveIndex(i)"
    ></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mapMutations } from 'vuex'
export default {
  name: 'Palette',
  computed: mapState({
    palette: state => state.palette.colors,
    activeIndex: state => state.palette.activeIndex,
  }),
  methods: {
    ...mapMutations('palette', ['setActiveIndex']),
  },
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
