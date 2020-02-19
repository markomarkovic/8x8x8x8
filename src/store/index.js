import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import app from './app'
import palette from './palette'
import animation from './animation'

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    app,
    palette,
    animation,
  },
})
