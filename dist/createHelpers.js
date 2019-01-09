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

function startsWith(data, search, pos) {
  return data.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
};

function dispatchActionPromise(instance, args) {
  return new (_ExternalPromise())(function (resolve, reject) {
    try {
      instance.emitEventChain('dispatchAction', args, function (d) {
        resolve(d);
      });
    } catch (e) {
      reject(e);
    }
  });
}

// 保证每次更改 store 是 immutable 的
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
function mutationHandler(func, state, payload, innerHelper) {
  if (innerHelper) {
    func = (0, _is.isFunc)(innerHelper) ? func || innerHelper : func || innerMutation[innerHelper];
  }
  if (!func) {
    return payload;
  }
  var payloadWithHelper = (0, _wrapDataInstance2.default)(payload);
  if (func._shouldImmutable) {
    return (0, _manipulate.produce)(state, function (draftState) {
      func(draftState, payloadWithHelper);
    });
  }
  var result = func(state, payloadWithHelper);
  // 确保return的值是一个新对象
  return result === state ? _extends({}, result) : result;
}

function commitGlobal(type, payload, innerHelper) {
  var _global$globalStoreCo = _global2.default.globalStoreConfig.mutations,
      mutations = _global$globalStoreCo === undefined ? {} : _global$globalStoreCo;

  if (!type) {
    throw new Error('not found ' + type + ' action');
  }
  if ((0, _is.isObject)(type)) {
    payload = type;
    type = 'update';
  }
  var finalMutation = mutationHandler(mutations[type], _global2.default.getGlobalState(), payload, innerHelper);
  var tmp = { state: finalMutation, mutation: { type: '$global:' + type, payload: payload } };
  _global2.default.emitter.emitEvent('updateState', tmp);
  // commit 的结果是一个同步行为
  return _global2.default.getGlobalState();
}

function dispatchGlobal(type, payload) {
  return new (_ExternalPromise())(function ($return, $error) {
    var _global$globalStoreCo2, actions, actionFunc, self, res;

    _global$globalStoreCo2 = _global2.default.globalStoreConfig.actions, actions = _global$globalStoreCo2 === undefined ? {} : _global$globalStoreCo2;

    actionFunc = actions[type];
    self = this;
    res = {};
    return _ExternalPromise().resolve(dispatchActionPromise(_global2.default.emitter, { type: type, payload: payload })).then(function ($await_2) {
      try {
        res = $await_2;
        if (!actionFunc) {
          console.warn('not found action', type, actions);
          return $return(_ExternalPromise().resolve(res));
        }
        return _ExternalPromise().resolve(actionFunc.call(self, {
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
        }, (0, _wrapDataInstance2.default)(payload))).then(function ($await_3) {
          try {
            res = $await_3;
            // 保证结果为一个 promise
            if (res instanceof _ExternalPromise()) {
              return $return(res);
            }
            return $return(_ExternalPromise().resolve(res));
          } catch ($boundEx) {
            return $error($boundEx);
          }
        }.bind(this), $error);
      } catch ($boundEx) {
        return $error($boundEx);
      }
    }.bind(this), $error);
  }.bind(this));
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
  var targetInstanceObj = arguments[3];

  return {
    commitGlobal: commitGlobal.bind(this),
    dispatchGlobal: dispatchGlobal.bind(this),
    commit: function commit(type, payload, innerHelper) {
      var _this = this;

      if (this.$page) {
        targetInstanceObj = {
          mutations: this.$page.$store.mutations,
          actions: this.$page.$store.actions,
          getInstance: function getInstance() {
            return _this.$page;
          }
        };
      }
      var finalKey = key || global.getCurrentPath() || global.getCurrentViewId() || -1;

      var _ref = targetInstanceObj ? getConfigFromInstance(_extends({}, targetInstanceObj.config, targetInstanceObj)) : global.storeInstance ? getConfigFromInstance(global) : getConfigFromGlobal(global, finalKey),
          instance = _ref.instance,
          _ref$mutations = _ref.mutations,
          mutations = _ref$mutations === undefined ? {} : _ref$mutations;

      console.log('mutations', targetInstanceObj, mutations);
      (0, _assign2.default)(mutations, config.mutations);
      if (!type) {
        throw new Error(type + ' not found');
      }
      if ((0, _is.isObject)(type)) {
        payload = type;
        type = 'update';
      }
      if ((0, _is.isString)(type) && startsWith(type, '$global:')) {
        var realType = type.split(':').pop();
        return commitGlobal.call(instance, realType, payload);
      }
      var prevState = _extends({}, instance.data);
      var finalMutation = mutationHandler(mutations[type], (0, _wrapDataInstance2.default)(instance.data), payload, innerHelper);
      instance.$emitter.emitEvent('updateState', { state: finalMutation, mutation: { type: type, payload: payload }, prevState: prevState });
      // commit 的结果是一个同步行为
      return instance.data;
    },
    dispatch: function dispatch(type, payload) {
      return new (_ExternalPromise())(function ($return, $error) {
        var _this2, finalKey, _ref2, instance, _ref2$mutations, mutations, _ref2$actions, actions, realType, actionFunc, self, res;

        _this2 = this;

        finalKey = key || global.getCurrentPath() || global.getCurrentViewId() || -1;
        if (this.$page) {
          targetInstanceObj = {
            mutations: this.$page.$store.mutations,
            actions: this.$page.$store.actions,
            getInstance: function getInstance() {
              return _this2.$page;
            }
          };
        }
        _ref2 = targetInstanceObj ? getConfigFromInstance(_extends({}, targetInstanceObj.config, targetInstanceObj)) : global.storeInstance ? getConfigFromInstance(global) : getConfigFromGlobal(global, finalKey), instance = _ref2.instance, _ref2$mutations = _ref2.mutations, mutations = _ref2$mutations === undefined ? {} : _ref2$mutations, _ref2$actions = _ref2.actions, actions = _ref2$actions === undefined ? {} : _ref2$actions;

        if (!type) {
          return $error(new Error('action type not found'));
        }
        if ((0, _is.isString)(type) && startsWith(type, '$global:')) {
          realType = type.split(':').pop();
          return $return(dispatchGlobal.call(this, realType, payload));
        }
        // 获取目标 instance 的数据
        (0, _assign2.default)(mutations, config.mutations);
        (0, _assign2.default)(actions, config.actions);

        actionFunc = actions[type];
        self = this;
        res = {};
        return _ExternalPromise().resolve(dispatchActionPromise(instance.$emitter, { type: type, payload: payload })).then(function ($await_4) {
          try {
            res = $await_4;
            if (!actionFunc) {
              console.warn('not found action', type, actions);
              return $return(_ExternalPromise().resolve(res));
            }
            return _ExternalPromise().resolve(actionFunc.call(self, {
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
            }, (0, _wrapDataInstance2.default)(payload))).then(function ($await_5) {
              try {
                res = $await_5;
                // 保证结果为一个 promise
                if (res instanceof _ExternalPromise()) {
                  return $return(res);
                }
                return $return(_ExternalPromise().resolve(res));
              } catch ($boundEx) {
                return $error($boundEx);
              }
            }.bind(this), $error);
          } catch ($boundEx) {
            return $error($boundEx);
          }
        }.bind(this), $error);
      }.bind(this));
    }
  };
}
// 创建 commit 和 dispatch instance
function createHelpers(actions, mutationsObj, emitter, getInstance) {
  var mutations = (0, _assign2.default)({}, mutationsObj, innerMutation);
  return {
    commitGlobal: commitGlobal.bind(this),
    dispatchGlobal: dispatchGlobal.bind(this),
    commit: function commit(type, payload, innerHelper) {
      if (!type) {
        throw new Error('not found ' + type + ' action');
      }
      if ((0, _is.isObject)(type)) {
        payload = type;
        type = 'update';
      }
      if ((0, _is.isString)(type) && startsWith(type, '$global:')) {
        var realType = type.split(':').pop();
        return commitGlobal.call(this, realType, payload);
      }
      var prevState = _extends({}, this.data);
      var finalMutation = mutationHandler(mutations[type], (0, _wrapDataInstance2.default)(this.data), payload, innerHelper);
      // 触发更新机制
      emitter.emitEvent('updateState', { state: finalMutation, mutation: { type: type, payload: payload }, prevState: prevState });
      // commit 的结果是一个同步行为，返回值
      return this.data;
    },
    dispatch: function dispatch(type, payload) {
      return new (_ExternalPromise())(function ($return, $error) {
        var actionCache, realType, actionFunc, self, res;

        actionCache = (0, _assign2.default)({}, actions, this);
        if (!type) {
          return $error(new Error('action type not found'));
        }
        if ((0, _is.isString)(type) && startsWith(type, '$global:')) {
          realType = type.split(':').pop();
          return $return(dispatchGlobal.call(this, realType, payload));
        }
        actionFunc = actionCache[type];
        self = this;
        res = {};
        return _ExternalPromise().resolve(dispatchActionPromise(emitter, { type: type, payload: payload })).then(function ($await_6) {
          try {
            res = $await_6;
            if (!actionFunc) {
              console.warn('not found action', type, actions);
              return $return(_ExternalPromise().resolve(res));
            }
            return _ExternalPromise().resolve(actionFunc.call(self, {
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
            }, (0, _wrapDataInstance2.default)(payload))).then(function ($await_7) {
              try {
                res = $await_7;
                // 保证结果为一个 promise
                if (res instanceof _ExternalPromise()) {
                  return $return(res);
                }
                return $return(_ExternalPromise().resolve(res));
              } catch ($boundEx) {
                return $error($boundEx);
              }
            }.bind(this), $error);
          } catch ($boundEx) {
            return $error($boundEx);
          }
        }.bind(this), $error);
      }.bind(this));
    }
  };
}