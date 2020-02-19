<template>
  <div class="frames">
    <div
      class="frame"
      v-for="(frame, i) in frames"
      v-bind:key="i"
      v-bind:class="{ active: activeIndex === i }"
      v-on:click="setActiveIndex(i)"
    ></div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'Frames',
  computed: mapState({
    frames: state => state.app.frames,
    activeIndex: state => state.animation.activeIndex,
  }),
  methods: {
    ...mapMutations('animation', ['setActiveIndex']),
  },
}
</script>

<style lang="scss">
.frames {
  margin: 2rem -1rem;

  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;

  .frame {
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
