'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createConnectHelpers = createConnectHelpers;
exports.default = createHelpers;

var _manipulate = require('./utils/manipulate');

var _is = require('./utils/is');

var _global = require('./global');

var _global2 = _interopRequireDefault(_global);

var _wrapDataInstance = require('./wrapDataInstance');

var _wrapDataInstance2 = _interopRequireDefault(_wrapDataInstance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ExternalPromiseCached;

function _ExternalPromise() { if (_ExternalPromiseCached) return _ExternalPromiseCached; if (typeof window !== 'undefined' && window.Promise && typeof window.Promise.resolve === 'function') { _ExternalPromiseCached = window.Promise; } else { _ExternalPromiseCached = require('babel-runtime/core-js/promise').default || require('babel-runtime/core-js/promise'); } return _ExternalPromiseCached; }

// 保证每次更改 store 是 immutable 的
function mutationHandler(func, state, payload) {
  if (!func) {
    return payload;
  }
  if (func._shouldImmutable) {
    return (0, _manipulate.produce)(state, function (draftState) {
      func(draftState, payload);
    });
  }
  var result = func(state, payload);
  // 确保return的值是一个新对象
  return result === state ? _extends({}, result) : result;
}

var innerMutation = {
  $setIn: function $setIn(s, d) {
    return (0, _manipulate.setIn)(s, d.path, d.value);
  },
  $update: function $update(s, o) {
    return (0, _manipulate.update)(s, o);
  },
  $deleteIn: function $deleteIn(s, d) {
    return (0, _manipulate.deleteIn)(s, d);
  },
  $resetStore: function $resetStore() {
    var _global$getInstanceBy = _global2.default.getInstanceByViewId(_global2.default.getCurrentViewId()),
        config = _global$getInstanceBy.config;

    var next = _extends({}, config.state);
    return next;
  }
};
function commitGlobal(type, payload) {
  var _global$globalStoreCo = _global2.default.globalStoreConfig.mutations,
      mutations = _global$globalStoreCo === undefined ? {} : _global$globalStoreCo;

  if (!type) {
    throw new Error('not found ' + type + ' action');
  }
  if ((0, _is.isObject)(type)) {
    payload = type;
    type = 'update';
  }
  var finalMutation = mutationHandler(mutations[type], _global2.default.getGlobalState(), payload);
  var tmp = { state: finalMutation, mutation: { type: '$global:' + type, payload: payload } };
  _global2.default.emitter.emitEvent('updateState', tmp);
  // commit 的结果是一个同步行为
  return _global2.default.getGlobalState();
}

function dispatchGlobal(type, payload) {
  var _global$globalStoreCo2 = _global2.default.globalStoreConfig.actions,
      actions = _global$globalStoreCo2 === undefined ? {} : _global$globalStoreCo2;

  var actionFunc = actions[type];
  if (!actionFunc) {
    return console.error('not found an action', type, actions);
  }
  var self = this;
  _global2.default.emitter.emitEvent('dispatchAction', { type: type, payload: payload });
  var res = actionFunc.call(self, {
    commit: commitGlobal.bind(self),
    dispatch: dispatchGlobal.bind(self),
    message: _global2.default.messageManager,
    put: function put(type) {
      var func = actions[type];
      if (!func) {
        throw new Error('not found ' + type + ' action');
      }
      if (func) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        func.apply(self, args);
      }
    },
    get state() {
      return (0, _wrapDataInstance2.default)(_global2.default.getGlobalState());
    },
    get getters() {
      return (0, _wrapDataInstance2.default)(_global2.default.getGlobalState().$getters);
    },
    get global() {
      return (0, _wrapDataInstance2.default)(_global2.default.getGlobalState());
    },
    getRef: function getRef(name) {
      return _global2.default.getComponentRef(name);
    },
    select: function select(filter) {
      return filter((0, _wrapDataInstance2.default)(_extends({}, _global2.default.getGlobalState())));
    },
    getState: function getState(instanceName) {
      if (!instanceName) {
        return (0, _wrapDataInstance2.default)(_global2.default.getGlobalState());
      }
      return _global2.default.getState(instanceName);
    }
  }, payload);
  // 保证结果为一个 promise
  if (res instanceof _ExternalPromise()) {
    return res;
  }
  return _ExternalPromise().resolve(res);
}

function getConfigFromGlobal(global, key) {
  var targetInstanceObj = global.getInstance(key || global.getCurrentViewId());
  var instance = targetInstanceObj ? targetInstanceObj.store.getInstance() : {};
  return _extends({}, targetInstanceObj.config, { instance: instance });
}
function getConfigFromInstance(target) {
  return {
    mutations: target.mutations,
    actions: target.actions,
    instance: target.getInstance()
  };
}
function createConnectHelpers(global, key) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var isInstance = arguments[3];

  return {
    commitGlobal: commitGlobal.bind(this),
    dispatchGlobal: dispatchGlobal.bind(this),
    commit: function commit(type, payload) {
      var finalKey = key || global.getCurrentPath() || global.getCurrentViewId() || -1;

      var _ref = global.storeInstance ? getConfigFromInstance(global) : getConfigFromGlobal(global, finalKey),
          instance = _ref.instance,
          _ref$mutations = _ref.mutations,
          mutations = _ref$mutations === undefined ? {} : _ref$mutations;

      (0, _assign2.default)(mutations, config.mutations);
      if (!type) {
        throw new Error(type + ' not found');
      }
      if ((0, _is.isObject)(type)) {
        payload = type;
        type = 'update';
      }
      if (type.startsWith('$global:')) {
        var realType = type.split(':').pop();
        return commitGlobal.call(instance, realType, payload);
      }
      var prevState = _extends({}, instance.data);
      var finalMutation = mutationHandler(mutations[type], (0, _wrapDataInstance2.default)(instance.data), payload);
      instance.$emitter.emitEvent('updateState', { state: finalMutation, mutation: { type: type, payload: payload }, prevState: prevState });
      // commit 的结果是一个同步行为
      return instance.data;
    },
    dispatch: function dispatch(type, payload) {
      var finalKey = key || global.getCurrentPath() || global.getCurrentViewId() || -1;

      var _ref2 = global.storeInstance ? getConfigFromInstance(global) : getConfigFromGlobal(global, finalKey),
          instance = _ref2.instance,
          _ref2$mutations = _ref2.mutations,
          mutations = _ref2$mutations === undefined ? {} : _ref2$mutations,
          _ref2$actions = _ref2.actions,
          actions = _ref2$actions === undefined ? {} : _ref2$actions;

      if (!type) {
        throw new Error('action type not found');
      }
      if (type.startsWith('$global:')) {
        var realType = type.split(':').pop();
        return dispatchGlobal.call(this, realType, payload);
      }
      // 获取目标 instance 的数据
      (0, _assign2.default)(mutations, config.mutations);
      (0, _assign2.default)(actions, config.actions);

      var actionFunc = actions[type];
      if (!actionFunc) {
        throw new Error('action not found');
      }
      var self = this;
      instance.$emitter.emitEvent('dispatchAction', { type: type, payload: payload });
      var res = actionFunc.call(self, {
        commit: this.commit.bind(self),
        dispatch: this.dispatch.bind(self),
        message: global.messageManager,
        dispatchGlobal: dispatchGlobal.bind(self),
        commitGlobal: commitGlobal.bind(self),
        put: function put(type) {
          var func = actions[type];
          if (!func) {
            throw new Error('not found ' + type + ' action');
          }
          if (func) {
            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
            }

            func.apply(self, args);
          }
        },
        get state() {
          return (0, _wrapDataInstance2.default)(instance.data, self);
        },
        get getters() {
          return (0, _wrapDataInstance2.default)(instance.data.$getters, self);
        },
        get global() {
          return (0, _wrapDataInstance2.default)(instance.data.$global);
        },
        getRef: function getRef(name) {
          return global.getComponentRef(name);
        },
        getState: function getState(instanceName) {
          if (!instanceName) {
            return (0, _wrapDataInstance2.default)(instance.data, self);
          }
          return global.getState(instanceName);
        },
        select: function select(filter) {
          return filter((0, _wrapDataInstance2.default)(_extends({}, instance.data)));
        }
      }, payload);
      // 保证结果为一个 promise
      if (res instanceof _ExternalPromise()) {
        return res;
      }
      return _ExternalPromise().resolve(res);
    }
  };
}
// 创建 commit 和 dispatch instance
function createHelpers(actions, mutationsObj, emitter, getInstance) {
  var mutations = (0, _assign2.default)({}, mutationsObj, innerMutation);
  return {
    commitGlobal: commitGlobal.bind(this),
    dispatchGlobal: dispatchGlobal.bind(this),
    commit: function commit(type, payload) {
      if (!type) {
        throw new Error('not found ' + type + ' action');
      }
      if ((0, _is.isObject)(type)) {
        payload = type;
        type = 'update';
      }
      if (type.startsWith('$global:')) {
        var realType = type.split(':').pop();
        return commitGlobal.call(this, realType, payload);
      }
      var prevState = _extends({}, this.data);
      var finalMutation = mutationHandler(mutations[type], (0, _wrapDataInstance2.default)(this.data), payload);
      // 触发更新机制
      emitter.emitEvent('updateState', { state: finalMutation, mutation: { type: type, payload: payload }, prevState: prevState });
      // commit 的结果是一个同步行为，返回值
      return this.data;
    },
    dispatch: function dispatch(type, payload) {
      var actionCache = (0, _assign2.default)({}, actions, this);
      if (!type) {
        throw new Error('action type not found');
      }
      if (type.startsWith('$global:')) {
        var realType = type.split(':').pop();
        return dispatchGlobal.call(this, realType, payload);
      }
      var actionFunc = actionCache[type];
      if (!actionFunc) {
        return console.error('not found an action', type, actions);
      }
      var self = this;
      emitter.emitEvent('dispatchAction', { type: type, payload: payload });
      var res = actionFunc.call(self, {
        commit: this.commit.bind(self),
        dispatch: this.dispatch.bind(self),
        dispatchGlobal: dispatchGlobal.bind(self),
        commitGlobal: commitGlobal.bind(self),
        message: _global2.default.messageManager,
        put: function put(type) {
          var func = actionCache[type];
          if (!func) {
            throw new Error('not found ' + type + ' action');
          }
          if (func) {
            for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
              args[_key3 - 1] = arguments[_key3];
            }

            func.apply(self, args);
          }
        },
        get state() {
          return (0, _wrapDataInstance2.default)(self.data, self);
        },
        get getters() {
          return (0, _wrapDataInstance2.default)(self.data.$getters, self);
        },
        get global() {
          return (0, _wrapDataInstance2.default)(self.data.$global);
        },
        getRef: function getRef(name) {
          return _global2.default.getComponentRef(name);
        },
        getState: function getState(instanceName) {
          if (!instanceName) {
            return (0, _wrapDataInstance2.default)(self.data, self);
          }
          return _global2.default.getState(instanceName);
        },
        select: function select(filter) {
          return filter((0, _wrapDataInstance2.default)(_extends({}, self.data)));
        }
      }, payload);
      // 保证结果为一个 promise
      if (res instanceof _ExternalPromise()) {
        return res;
      }
      return _ExternalPromise().resolve(res);
    }
  };
}