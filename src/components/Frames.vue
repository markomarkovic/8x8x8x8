<template>
  <div class="frames">
    <div v-for="(frame, i) in frames" v-bind:key="i" class="frame"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Frames',
  computed: mapState({
    frames: state => state.app.frames,
  }),
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
