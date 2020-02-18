export default {
  namespaced: true,
  state: {
    activeIndex: 0,
    colors: [
      '#000000',
      '#a0a0a0',
      '#bb0000',
      '#008800',
      '#2244cc',
      '#eeba00',
      '#bb5522',
      '#00cccc',
    ],
  },
  mutations: {
    setActiveIndex(state, payload) {
      state.activeIndex = payload
    },
  },
}
