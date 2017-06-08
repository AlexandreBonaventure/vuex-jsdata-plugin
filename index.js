import Vue from "vue"
import get from "lodash.get"
import './utils/polyfill'

const config = {}
const { set, delete: remove } = Vue
const MUTATION = 'datastore/REFRESH_DATASTORE'
const MUTATION_DELETE = 'datastore/DELETE'
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
    const resources = Object.values(DStore.definitions)
    let getters = {}
    let moduleState = {}
    set(store.state, namespace, {}) // init state
    getters[namespace] = (state) => state[namespace] // set global getter

    resources.forEach(({ class: resourceName }) => {
      const key = `${namespace}${resourceName}`
      getters[key] = (state) => state[resourceName]
      set(moduleState, resourceName, {})
    })

    const module = {
      state: moduleState, // init resource state
      getters,
      mutations: {
        [MUTATION](state, { type, data }) {
          const { id } = data
          const namespace = state[type]
          set(namespace, id, Object.assign(JSON.parse(JSON.stringify(data)))) // assign to trigger reactivity
        },
        [MUTATION_DELETE](state, { type, data }) {
          const { id } = data
          const namespace = state[type]
          remove(namespace, id) // assign to trigger reactivity
        },
      },
    }
    store.registerModule('DS', module)

    function commitRefresh(res, data) {
      const commit = instance => {
        // set(instance, '__refresh', !instance.__refresh)
        store.commit(MUTATION, {
          type: res.class,
          data: instance,
        }, { silent })
      }
      if (Array.isArray(data)) data.forEach(commit)
      else commit(data)
    }
    function commitDelete(res, data) {
      const commit = instance => {
        store.commit(MUTATION_DELETE, {
          type: res.class,
          data: instance,
        }, { silent })
      }
      if (Array.isArray(data)) data.forEach(commit)
      else commit(data)
    }

    resources.forEach((resource) => {
      resource.on('Refresh', (res, id) => {
        const data = res.get(id)
        commitRefresh(res, data)
      })
      // resource.on('DS.change', (res, data) => commitRefresh(res, data))
      resource.on('DS.afterDestroy', (res, data) => {
        res.off('DS.change')
        commitDelete(res, data)
        setTimeout(() => { // FIXME
          res.on('DS.change', function (res, data) {
            commitRefresh(res, data);
          });
        }, 100)
      })
      const refreshCb = (res, data) => commitRefresh(res, data)
      resource.on('DS.afterInject', function handler(res, data) {
        refreshCb(res, data)
        // resource.off('DS.afterInject', handler)
        // resource.on('DS.change', refreshCb)
      })
    })
  }
}

export function mapResources(resources = []) {
  function generateGetter(name, key) {
    return function getter() {
      const id = get(this, key)
      if (id === null || id === undefined || !this.$store.state.DS[name][id]) {
        console.warn('no resource with id:' + id)
        return undefined
      } // !IMPORTANT trigger reactivity
      return DStore.get(name, id);
    }
  }
  const resourceGetters = resources.reduce((sum, resource) => {
    const getterName = Object.keys(resource)[0]
    resource[getterName] = generateGetter(...resource[getterName])
    return Object.assign(sum, resource)
  }, {})
  return resourceGetters
}
