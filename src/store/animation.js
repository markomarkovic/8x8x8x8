export default {
  namespaced: true,
  state: {
    activeIndex: 0,
    frames: [...Array(8)].map(() =>
      [...Array(64)].map(() => Math.round(Math.random() * 8))
    ),
  },
  mutations: {
    setActiveIndex(state, payload) {
      state.activeIndex = payload
    },
  },
}
