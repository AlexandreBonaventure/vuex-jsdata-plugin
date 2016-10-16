import { set } from "vue"

export default function(DStore, {
  namespace = 'DS',
  silent = true,
} = {}) {
  if (!DStore) {
    console.warn('You must initialize vuex-jsdata-plugin with a DS store object from js-data')
    return
  }
  return function(store) {
    const ressources = Object.values(DStore.definitions)
    let getters = {}
    let moduleState = {}
    set(store.state, namespace, {}) // init state
    getters[namespace] = (state) => state[namespace] // set global getter

    ressources.forEach(({ class: ressourceName }) => {
      const key = `${namespace}${ressourceName}`
      getters[key] = (state) => state[ressourceName]
      moduleState[ressourceName] = {}
    })

    const module = {
      state: moduleState, // init ressource state
      getters,
      mutations: {
        REFRESH_DATASTORE(state, { type, data }) {
          const { id } = data
          const namespace = state[type]
          set(namespace, id, Object.assign({}, data)) // assign to trigger reactivity
        },
      },
    }
    store.registerModule('DS', module)
    ressources.forEach((ressource) => {
      ressource.on('DS.afterInject', (res, data) => {
        const commit = instance => store.commit('REFRESH_DATASTORE', {
          type: res.class,
          data: instance, //JSON.parse(JSON.stringify(instance)),
        }, { silent })
        if (Array.isArray(data)) data.forEach(commit)
        else commit(data)
      })
    })
  }
}
