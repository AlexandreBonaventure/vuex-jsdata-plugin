(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.vuexjsdataplugin = factory());
}(this, (function () { 'use strict';

var index = function (DStore) {
  if (!DStore) {
    console.warn('You must initialize vuex-jsdata-plugin with a DS store object from js-data');
    return;
  }
  return function (store) {
    var ressources = Object.values(DStore.definitions);
    var getters = {
      DS: function DS(state) {
        return state.DS;
      }
    };
    ressources.forEach(function (res) {
      getters['DS' + res.class] = function (state) {
        return state[res.class];
      };
    });
    var module = {
      getters: getters,
      mutations: {
        REFRESH_DATASTORE: function REFRESH_DATASTORE(state, _ref) {
          var type = _ref.type;
          var data = _ref.data;
          var id = data.id;

          var namespace = state[type];
          if (!namespace) {
            Vue.set(state, type, {});
            namespace = state[type];
          }
          Vue.set(namespace, id, Object.assign({}, data)); // assign to trigger reactivity
        }
      }
    };
    store.registerModule('DS', module);
    ressources.forEach(function (ressource) {
      ressource.on('DS.afterInject', function (res, data) {
        var commit = function commit(instance) {
          return store.commit('REFRESH_DATASTORE', {
            type: res.class,
            data: instance }, { silent: true });
        };
        if (Array.isArray(data)) data.forEach(commit);else commit(data);
      });
    });
  };
}

return index;

})));
