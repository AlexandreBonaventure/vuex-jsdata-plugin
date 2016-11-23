import Vue from 'vue/dist/vue.common.js'
import Vuex from 'vuex'
import plugins from './plugins'

const state = {
  count: 0,
}

const mutations = {
  INCREMENT (state) {
    state.count++
  },
}

const actions = {
  INCREMENT ({ commit }) {
    commit('INCREMENT')
  },
}

Vue.use(Vuex)
const store = new Vuex.Store({
  state,
  mutations,
  plugins,
  actions,
})

export default store
