import { set } from "vue"
import get from "lodash.get"

const config = {}
let DStore

export default function(_DStore, {
  namespace = 'DS',
  silent = true,
} = {}) {
  DStore = _DStore
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

export function mapRessources(ressources = []) {
  function generateGetter(name, key) {
    return function getter() {
      // console.log(this.$store);
      // console.log(this.$store.getters[`DS${name}`][key]);
      // return this.$store.getters[`DS${name}`][key]
      // console.log(Store)
      this.$store.getters[`DS${name}`][key]
      return DStore.get(name, get(this, key))
    }
  }
  const ressourceGetters = ressources.reduce((sum, ressource) => {
    const getterName = Object.keys(ressource)[0]
    ressource[getterName] = generateGetter(...ressource[getterName])
    return Object.assign(sum, ressource)
  }, {})
  console.log(ressourceGetters);
  return ressourceGetters
}
