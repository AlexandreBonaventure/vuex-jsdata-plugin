
export default function(DStore) {
  if (!DStore) {
    console.warn('You must initialize vuex-jsdata-plugin with a DS store object from js-data')
    return
  }
  return function(store) {
    const ressources = Object.values(DStore.definitions)
    let getters = {
      DS: (state) => state.DS
    }
    ressources.forEach(res => {
      getters[`DS${res.class}`] = (state) => state[res.class]
    })
    const module = {
      getters,
      mutations: {
        REFRESH_DATASTORE(state, { type, data }) {
          const { id } = data
          let namespace = state[type]
          if (!namespace) {
            Vue.set(state, type, {})
            namespace = state[type]
          }
          Vue.set(namespace, id, Object.assign({}, data)) // assign to trigger reactivity
        },
      },
    }
    store.registerModule('DS', module)
    ressources.forEach((ressource) => {
      ressource.on('DS.afterInject', (res, data) => {
        const commit = instance => store.commit('REFRESH_DATASTORE', {
          type: res.class,
          data: instance, //JSON.parse(JSON.stringify(instance)),
        }, { silent: true })
        if (Array.isArray(data)) data.forEach(commit)
        else commit(data)
      })
    })
  }
}
