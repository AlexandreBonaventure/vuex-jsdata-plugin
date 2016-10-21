(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue'), require('lodash.get')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue', 'lodash.get'], factory) :
  (factory((global.vuexjsdataplugin = global.vuexjsdataplugin || {}),global.vue,global.get));
}(this, (function (exports,vue,get) { 'use strict';

get = 'default' in get ? get['default'] : get;

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();













var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set$1 = function set$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$1(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var MUTATION = 'datastore/REFRESH_DATASTORE';
var DStore = void 0;

var index = function (_DStore) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _ref$namespace = _ref.namespace;
  var namespace = _ref$namespace === undefined ? 'DS' : _ref$namespace;
  var _ref$silent = _ref.silent;
  var silent = _ref$silent === undefined ? true : _ref$silent;

  DStore = _DStore;
  if (!DStore) {
    console.warn('You must initialize vuex-jsdata-plugin with a DS store object from js-data');
    return;
  }

  return function (store) {
    var ressources = Object.values(DStore.definitions);
    var getters = {};
    var moduleState = {};
    vue.set(store.state, namespace, {}); // init state
    getters[namespace] = function (state) {
      return state[namespace];
    }; // set global getter

    ressources.forEach(function (_ref2) {
      var ressourceName = _ref2.class;

      var key = "" + namespace + ressourceName;
      getters[key] = function (state) {
        return state[ressourceName];
      };
      moduleState[ressourceName] = {};
    });

    var module = {
      state: moduleState, // init ressource state
      getters: getters,
      mutations: defineProperty({}, MUTATION, function (state, _ref3) {
        var type = _ref3.type;
        var data = _ref3.data;
        var id = data.id;

        var namespace = state[type];
        vue.set(namespace, id, Object.assign({}, data)); // assign to trigger reactivity
      })
    };
    store.registerModule('DS', module);
    ressources.forEach(function (ressource) {
      ressource.on('DS.change', function (res, data) {
        var commit = function commit(instance) {
          return store.commit(MUTATION, {
            type: res.class,
            data: instance
          }, { silent: silent });
        };
        if (Array.isArray(data)) data.forEach(commit);else commit(data);
      });
    });
  };
};

function mapRessources() {
  var ressources = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  function generateGetter(name, key) {
    return function getter() {
      var id = get(this, key);
      if (!id) return undefined;
      this.$store.state.DS[name][id]; // !IMPORTANT trigger reactivity
      return DStore.get(name, id);
    };
  }
  var ressourceGetters = ressources.reduce(function (sum, ressource) {
    var getterName = Object.keys(ressource)[0];
    ressource[getterName] = generateGetter.apply(undefined, toConsumableArray(ressource[getterName]));
    return Object.assign(sum, ressource);
  }, {});
  console.log(ressourceGetters);
  return ressourceGetters;
}

exports['default'] = index;
exports.mapRessources = mapRessources;

Object.defineProperty(exports, '__esModule', { value: true });

})));
