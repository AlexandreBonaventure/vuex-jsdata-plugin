import createLogger from 'vuex/dist/logger'
import jsDataPlugin from '../../../dist/vuex-jsdata-plugin.js'
import store from 'jsdata/index'

const plugins = [
  jsDataPlugin(store, { silent: false }),
]

export default process.env.NODE_ENV !== 'production'
  ? [
    createLogger(),
    ...plugins,
  ] : plugins
