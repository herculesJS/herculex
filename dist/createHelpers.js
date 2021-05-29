function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { setIn, update, produce, deleteIn } from './utils/manipulate';
import { isObject, isFunc, isString } from './utils/is';
import global from './global';
import wrapDataInstance from './wrapDataInstance'; // TODO: 这个页面需要重构！

function startsWith(data, search, pos) {
  return data.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
}

;

function dispatchActionPromise(instance, args) {
  return new Promise(function (resolve, reject) {
    try {
      instance.emitEventChain('dispatchAction', args, function (d) {
        resolve(d);
      });
    } catch (e) {
      reject(e);
    }
  });
} // 保证每次更改 store 是 immutable 的


var innerMutation = {
  $setIn: function $setIn(s, d) {
    return setIn(s, d.path, d.value);
  },
  $update: function $update(s, o) {
    return update(s, o);
  },
  $deleteIn: function $deleteIn(s, d) {
    return deleteIn(s, d);
  },
  $resetStore: function $resetStore() {
    var _global$getInstanceBy = global.getInstanceByViewId(global.getCurrentViewId()),
        config = _global$getInstanceBy.config;

    var next = _extends({}, config.state);

    return next;
  }
};

function mutationHandler(func, state, payload, innerHelper) {
  if (innerHelper) {
    func = isFunc(innerHelper) ? func || innerHelper : func || innerMutation[innerHelper];
  }

  if (!func) {
    return payload;
  }

  var payloadWithHelper = wrapDataInstance(payload);

  if (func._shouldImmutable) {
    return produce(state, function (draftState) {
      func(draftState, payloadWithHelper);
    });
  }

  var result = func(state, payloadWithHelper); // 确保return的值是一个新对象

  return result === state ? _extends({}, result) : result;
}

function commitGlobal(type, payload, innerHelper) {
  var _global$globalStoreCo = global.globalStoreConfig.mutations,
      mutations = _global$globalStoreCo === void 0 ? {} : _global$globalStoreCo;

  if (!type) {
    throw new Error("not found " + type + " action");
  }

  if (isObject(type)) {
    payload = type;
    type = 'update';
  }

  var finalMutation = mutationHandler(mutations[type], global.getGlobalState(), payload, innerHelper);
  var tmp = {
    state: finalMutation,
    mutation: {
      type: "$global:" + type,
      payload: payload
    }
  };
  global.emitter.emitEvent('updateState', tmp); // commit 的结果是一个同步行为

  return global.getGlobalState();
}

function dispatchGlobal(_x, _x2) {
  return _dispatchGlobal.apply(this, arguments);
}

function _dispatchGlobal() {
  _dispatchGlobal = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(type, payload) {
    var _global$globalStoreCo2, actions, actionFunc, self, res;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _global$globalStoreCo2 = global.globalStoreConfig.actions, actions = _global$globalStoreCo2 === void 0 ? {} : _global$globalStoreCo2;
            actionFunc = actions[type];
            self = this;
            res = {};
            _context3.next = 6;
            return dispatchActionPromise(global.emitter, {
              type: type,
              payload: payload
            });

          case 6:
            res = _context3.sent;

            if (actionFunc) {
              _context3.next = 10;
              break;
            }

            console.warn('not found action', type, actions);
            return _context3.abrupt("return", Promise.resolve(res));

          case 10:
            _context3.t0 = actionFunc;
            _context3.t1 = self;
            _context3.t2 = commitGlobal.bind(self);
            _context3.t3 = dispatchGlobal.bind(self);
            _context3.t4 = global.messageManager;

            _context3.t5 = function put(type) {
              var func = actions[type];

              if (!func) {
                throw new Error("not found " + type + " action");
              }

              if (func) {
                for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                  args[_key3 - 1] = arguments[_key3];
                }

                func.apply(self, args);
              }
            };

            _context3.t6 = function getRef(name) {
              return global.getComponentRef(name);
            };

            _context3.t7 = function select(filter) {
              return filter(wrapDataInstance(_extends({}, global.getGlobalState())));
            };

            _context3.t8 = function getState(instanceName) {
              if (!instanceName) {
                return wrapDataInstance(global.getGlobalState());
              }

              return global.getState(instanceName);
            };

            _context3.t9 = {
              commit: _context3.t2,
              dispatch: _context3.t3,
              message: _context3.t4,
              put: _context3.t5,

              get state() {
                return wrapDataInstance(global.getGlobalState());
              },

              get getters() {
                return wrapDataInstance(global.getGlobalState().$getters);
              },

              get global() {
                return wrapDataInstance(global.getGlobalState());
              },

              getRef: _context3.t6,
              select: _context3.t7,
              getState: _context3.t8
            };
            _context3.t10 = wrapDataInstance(payload);
            _context3.next = 23;
            return _context3.t0.call.call(_context3.t0, _context3.t1, _context3.t9, _context3.t10);

          case 23:
            res = _context3.sent;

            if (!(res instanceof Promise)) {
              _context3.next = 26;
              break;
            }

            return _context3.abrupt("return", res);

          case 26:
            return _context3.abrupt("return", Promise.resolve(res));

          case 27:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return _dispatchGlobal.apply(this, arguments);
}

function getConfigFromGlobal(global, key) {
  var targetInstanceObj = global.getInstance(key || global.getCurrentViewId());
  var instance = targetInstanceObj ? targetInstanceObj.store.getInstance() : {};
  return _extends({}, targetInstanceObj.config, {
    instance: instance
  });
}

function getConfigFromInstance(target) {
  return {
    mutations: target.mutations,
    actions: target.actions,
    instance: target.getInstance()
  };
}

export function createConnectHelpers(global, key, config, isInstance) {
  if (config === void 0) {
    config = {};
  }

  return {
    commitGlobal: commitGlobal.bind(this),
    dispatchGlobal: dispatchGlobal.bind(this),
    commit: function commit(type, payload, innerHelper) {
      var finalKey = key || global.getCurrentPath() || global.getCurrentViewId() || -1;

      var _ref = global.storeInstance ? getConfigFromInstance(global) : getConfigFromGlobal(global, finalKey),
          instance = _ref.instance,
          _ref$mutations = _ref.mutations,
          mutations = _ref$mutations === void 0 ? {} : _ref$mutations;

      Object.assign(mutations, config.mutations);

      if (!type) {
        throw new Error(type + " not found");
      }

      if (isObject(type)) {
        payload = type;
        type = 'update';
      }

      if (isString(type) && startsWith(type, '$global:')) {
        var realType = type.split(':').pop();
        return commitGlobal.call(instance, realType, payload);
      }

      var prevState = _extends({}, instance.data);

      var finalMutation = mutationHandler(mutations[type], wrapDataInstance(instance.data), payload, innerHelper);
      instance.$emitter.emitEvent('updateState', {
        state: finalMutation,
        mutation: {
          type: type,
          payload: payload
        },
        prevState: prevState
      }); // commit 的结果是一个同步行为

      return instance.data;
    },
    dispatch: function dispatch(type, payload) {
      var _this = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var finalKey, _ref2, instance, _ref2$mutations, mutations, _ref2$actions, actions, realType, actionFunc, self, res;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                finalKey = key || global.getCurrentPath() || global.getCurrentViewId() || -1;
                _ref2 = global.storeInstance ? getConfigFromInstance(global) : getConfigFromGlobal(global, finalKey), instance = _ref2.instance, _ref2$mutations = _ref2.mutations, mutations = _ref2$mutations === void 0 ? {} : _ref2$mutations, _ref2$actions = _ref2.actions, actions = _ref2$actions === void 0 ? {} : _ref2$actions;

                if (type) {
                  _context.next = 4;
                  break;
                }

                throw new Error('action type not found');

              case 4:
                if (!(isString(type) && startsWith(type, '$global:'))) {
                  _context.next = 7;
                  break;
                }

                realType = type.split(':').pop();
                return _context.abrupt("return", dispatchGlobal.call(_this, realType, payload));

              case 7:
                // 获取目标 instance 的数据
                Object.assign(mutations, config.mutations);
                Object.assign(actions, config.actions);
                actionFunc = actions[type];
                self = _this;
                res = {};
                _context.next = 14;
                return dispatchActionPromise(instance.$emitter, {
                  type: type,
                  payload: payload
                });

              case 14:
                res = _context.sent;

                if (actionFunc) {
                  _context.next = 18;
                  break;
                }

                console.warn('not found action', type, actions);
                return _context.abrupt("return", Promise.resolve(res));

              case 18:
                _context.t0 = actionFunc;
                _context.t1 = self;
                _context.t2 = _this.commit.bind(self);
                _context.t3 = _this.dispatch.bind(self);
                _context.t4 = global.messageManager;
                _context.t5 = dispatchGlobal.bind(self);
                _context.t6 = commitGlobal.bind(self);

                _context.t7 = function put(type) {
                  var func = actions[type];

                  if (!func) {
                    throw new Error("not found " + type + " action");
                  }

                  if (func) {
                    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                      args[_key - 1] = arguments[_key];
                    }

                    func.apply(self, args);
                  }
                };

                _context.t8 = function getRef(name) {
                  return global.getComponentRef(name);
                };

                _context.t9 = function getState(instanceName) {
                  if (!instanceName) {
                    return wrapDataInstance(instance.data, self);
                  }

                  return global.getState(instanceName);
                };

                _context.t10 = function select(filter) {
                  return filter(wrapDataInstance(_extends({}, instance.data)));
                };

                _context.t11 = {
                  commit: _context.t2,
                  dispatch: _context.t3,
                  message: _context.t4,
                  dispatchGlobal: _context.t5,
                  commitGlobal: _context.t6,
                  put: _context.t7,

                  get state() {
                    return wrapDataInstance(instance.data, self);
                  },

                  get getters() {
                    return wrapDataInstance(instance.data.$getters, self);
                  },

                  get global() {
                    return wrapDataInstance(instance.data.$global);
                  },

                  getRef: _context.t8,
                  getState: _context.t9,
                  select: _context.t10
                };
                _context.t12 = wrapDataInstance(payload);
                _context.next = 33;
                return _context.t0.call.call(_context.t0, _context.t1, _context.t11, _context.t12);

              case 33:
                res = _context.sent;

                if (!(res instanceof Promise)) {
                  _context.next = 36;
                  break;
                }

                return _context.abrupt("return", res);

              case 36:
                return _context.abrupt("return", Promise.resolve(res));

              case 37:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    }
  };
} // 创建 commit 和 dispatch instance

export default function createHelpers(actions, mutationsObj, emitter, getInstance) {
  var mutations = Object.assign({}, mutationsObj, innerMutation);
  return {
    commitGlobal: commitGlobal.bind(this),
    dispatchGlobal: dispatchGlobal.bind(this),
    commit: function commit(type, payload, innerHelper) {
      if (!type) {
        throw new Error("not found " + type + " action");
      }

      if (isObject(type)) {
        payload = type;
        type = 'update';
      }

      if (isString(type) && startsWith(type, '$global:')) {
        var realType = type.split(':').pop();
        return commitGlobal.call(this, realType, payload);
      }

      var prevState = _extends({}, this.data);

      var finalMutation = mutationHandler(mutations[type], wrapDataInstance(this.data), payload, innerHelper); // 触发更新机制

      emitter.emitEvent('updateState', {
        state: finalMutation,
        mutation: {
          type: type,
          payload: payload
        },
        prevState: prevState
      }); // commit 的结果是一个同步行为，返回值

      return this.data;
    },
    dispatch: function dispatch(type, payload) {
      var _this2 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var actionCache, realType, actionFunc, self, res;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                actionCache = Object.assign({}, actions, _this2);

                if (type) {
                  _context2.next = 3;
                  break;
                }

                throw new Error('action type not found');

              case 3:
                if (!(isString(type) && startsWith(type, '$global:'))) {
                  _context2.next = 6;
                  break;
                }

                realType = type.split(':').pop();
                return _context2.abrupt("return", dispatchGlobal.call(_this2, realType, payload));

              case 6:
                actionFunc = actionCache[type];
                self = _this2;
                res = {};
                _context2.next = 11;
                return dispatchActionPromise(emitter, {
                  type: type,
                  payload: payload
                });

              case 11:
                res = _context2.sent;

                if (actionFunc) {
                  _context2.next = 15;
                  break;
                }

                console.warn('not found action', type, actions);
                return _context2.abrupt("return", Promise.resolve(res));

              case 15:
                _context2.t0 = actionFunc;
                _context2.t1 = self;
                _context2.t2 = _this2.commit.bind(self);
                _context2.t3 = _this2.dispatch.bind(self);
                _context2.t4 = dispatchGlobal.bind(self);
                _context2.t5 = commitGlobal.bind(self);
                _context2.t6 = global.messageManager;

                _context2.t7 = function put(type) {
                  var func = actionCache[type];

                  if (!func) {
                    throw new Error("not found " + type + " action");
                  }

                  if (func) {
                    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                      args[_key2 - 1] = arguments[_key2];
                    }

                    func.apply(self, args);
                  }
                };

                _context2.t8 = function getRef(name) {
                  return global.getComponentRef(name);
                };

                _context2.t9 = function getState(instanceName) {
                  if (!instanceName) {
                    return wrapDataInstance(self.data, self);
                  }

                  return global.getState(instanceName);
                };

                _context2.t10 = function select(filter) {
                  return filter(wrapDataInstance(_extends({}, self.data)));
                };

                _context2.t11 = {
                  commit: _context2.t2,
                  dispatch: _context2.t3,
                  dispatchGlobal: _context2.t4,
                  commitGlobal: _context2.t5,
                  message: _context2.t6,
                  put: _context2.t7,

                  get state() {
                    return wrapDataInstance(self.data, self);
                  },

                  get getters() {
                    return wrapDataInstance(self.data.$getters, self);
                  },

                  get global() {
                    return wrapDataInstance(self.data.$global);
                  },

                  getRef: _context2.t8,
                  getState: _context2.t9,
                  select: _context2.t10
                };
                _context2.t12 = wrapDataInstance(payload);
                _context2.next = 30;
                return _context2.t0.call.call(_context2.t0, _context2.t1, _context2.t11, _context2.t12);

              case 30:
                res = _context2.sent;

                if (!(res instanceof Promise)) {
                  _context2.next = 33;
                  break;
                }

                return _context2.abrupt("return", res);

              case 33:
                return _context2.abrupt("return", Promise.resolve(res));

              case 34:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    }
  };
}