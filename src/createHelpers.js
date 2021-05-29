import { setIn, update, produce, deleteIn } from './utils/manipulate';
import { isObject, isFunc, isString } from './utils/is';
import myGlobal from './global';
import wrapDataInstance from './wrapDataInstance';

// TODO: 这个页面需要重构！
function startsWith(data, search, pos) {
  return data.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
};

function dispatchActionPromise(instance, args) {
  return new Promise((resolve, reject) => {
    try {
      instance.emitEventChain('dispatchAction', args, d => {
        resolve(d);
      });
    } catch (e) {
      reject(e);
    }
  });
}

// 保证每次更改 store 是 immutable 的
const innerMutation = {
  $setIn: (s, d) => setIn(s, d.path, d.value),
  $update: (s, o) => update(s, o),
  $deleteIn: (s, d) => deleteIn(s, d),
  $resetStore: function() {
    const { config } = myGlobal.getInstanceByViewId(myGlobal.getCurrentViewId());
    let next = { ...config.state };
    return next;
  }
};
function mutationHandler (func, state, payload, innerHelper) {
  if (innerHelper) {
    func = isFunc(innerHelper) ? func || innerHelper : func || innerMutation[innerHelper];
  }
  if (!func) {
    return payload;
  }
  const payloadWithHelper = wrapDataInstance(payload);
  if (func._shouldImmutable) {
    return produce(state, draftState => {
      func(draftState, payloadWithHelper);
    });
  }
  const result = func(state, payloadWithHelper);
  // 确保return的值是一个新对象
  return result === state ? { ...result } : result;
}

function commitGlobal(type, payload, innerHelper) {
  const {
    mutations = {}
  } = myGlobal.globalStoreConfig;
  if (!type) {
    throw new Error(`not found ${type} action`);
  }
  if (isObject(type)) {
    payload = type;
    type = 'update';
  }
  const finalMutation = mutationHandler(mutations[type], myGlobal.getGlobalState(), payload, innerHelper);
  const tmp = { state: finalMutation, mutation: { type: `$global:${type}`, payload } };
  myGlobal.emitter.emitEvent('updateState', tmp);
  // commit 的结果是一个同步行为
  return myGlobal.getGlobalState();
}

async function dispatchGlobal(type, payload) {
  const {
    actions = {}
  } = myGlobal.globalStoreConfig;
  const actionFunc = actions[type];
  const self = this;
  let res = {};
  res = await dispatchActionPromise(myGlobal.emitter, { type, payload });
  if (!actionFunc) {
    console.warn('not found action', type, actions);
    return Promise.resolve(res);
  }
  res = await actionFunc.call(self, {
    commit: commitGlobal.bind(self),
    dispatch: dispatchGlobal.bind(self),
    message: myGlobal.messageManager,
    put: function (type, ...args) {
      const func = actions[type];
      if (!func) {
        throw new Error(`not found ${type} action`);
      }
      if (func) {
        func.apply(self, args);
      }
    },
    get state() {
      return wrapDataInstance(myGlobal.getGlobalState());
    },
    get getters() {
      return wrapDataInstance(myGlobal.getGlobalState().$getters);
    },
    get global() {
      return wrapDataInstance(myGlobal.getGlobalState());
    },
    getRef(name) {
      return myGlobal.getComponentRef(name);
    },
    select(filter) {
      return filter(wrapDataInstance({ ...myGlobal.getGlobalState() }));
    },
    getState(instanceName) {
      if (!instanceName) {
        return wrapDataInstance(myGlobal.getGlobalState());
      }
      return myGlobal.getState(instanceName);
    }
  }, wrapDataInstance(payload));
  // 保证结果为一个 promise
  if (res instanceof Promise) {
    return res;
  }
  return Promise.resolve(res);
}

function getConfigFromGlobal(myGlobal, key) {
  const targetInstanceObj = myGlobal.getInstance(key || myGlobal.getCurrentViewId());
  const instance = targetInstanceObj ? targetInstanceObj.store.getInstance() : {};
  return { ...targetInstanceObj.config, instance };
}
function getConfigFromInstance(target) {
  return {
    mutations: target.mutations,
    actions: target.actions,
    instance: target.getInstance()
  };
}
export function createConnectHelpers(myGlobal, key, config = {}, isInstance) {
  return {
    commitGlobal: commitGlobal.bind(this),
    dispatchGlobal: dispatchGlobal.bind(this),
    commit(type, payload, innerHelper) {
      const finalKey = key || myGlobal.getCurrentPath() || myGlobal.getCurrentViewId() || -1;
      const { instance, mutations = {} } = myGlobal.storeInstance ? getConfigFromInstance(myGlobal) : getConfigFromGlobal(myGlobal, finalKey);
      Object.assign(mutations, config.mutations);
      if (!type) {
        throw new Error(`${type} not found`);
      }
      if (isObject(type)) {
        payload = type;
        type = 'update';
      }
      if (isString(type) && startsWith(type, '$global:')) {
        const realType = type.split(':').pop();
        return commitGlobal.call(instance, realType, payload);
      }
      const prevState = { ...instance.data };
      const finalMutation = mutationHandler(mutations[type], wrapDataInstance(instance.data), payload, innerHelper);
      instance.$emitter.emitEvent('updateState', { state: finalMutation, mutation: { type, payload }, prevState });
      // commit 的结果是一个同步行为
      return instance.data;
    },
    async dispatch(type, payload) {
      const finalKey = key || myGlobal.getCurrentPath() || myGlobal.getCurrentViewId() || -1;
      const {
        instance,
        mutations = {},
        actions = {}
      } = myGlobal.storeInstance ? getConfigFromInstance(myGlobal) : getConfigFromGlobal(myGlobal, finalKey);
      if (!type) {
        throw new Error('action type not found');
      }
      if (isString(type) && startsWith(type, '$global:')) {
        const realType = type.split(':').pop();
        return dispatchGlobal.call(this, realType, payload);
      }
      // 获取目标 instance 的数据
      Object.assign(mutations, config.mutations);
      Object.assign(actions, config.actions);

      const actionFunc = actions[type];
      const self = this;
      let res = {};
      res = await dispatchActionPromise(instance.$emitter, { type, payload });
      if (!actionFunc) {
        console.warn('not found action', type, actions);
        return Promise.resolve(res);
      }
      res = await actionFunc.call(self, {
        commit: this.commit.bind(self),
        dispatch: this.dispatch.bind(self),
        message: myGlobal.messageManager,
        dispatchGlobal: dispatchGlobal.bind(self),
        commitGlobal: commitGlobal.bind(self),
        put: function (type, ...args) {
          const func = actions[type];
          if (!func) {
            throw new Error(`not found ${type} action`);
          }
          if (func) {
            func.apply(self, args);
          }
        },
        get state() {
          return wrapDataInstance(instance.data, self);
        },
        get getters() {
          return wrapDataInstance(instance.data.$getters, self);
        },
        get global() {
          return wrapDataInstance(instance.data.$global);
        },
        getRef(name) {
          return myGlobal.getComponentRef(name);
        },
        getState(instanceName) {
          if (!instanceName) {
            return wrapDataInstance(instance.data, self);
          }
          return myGlobal.getState(instanceName);
        },
        select(filter) {
          return filter(wrapDataInstance({ ...instance.data }));
        }
      }, wrapDataInstance(payload));
      // 保证结果为一个 promise
      if (res instanceof Promise) {
        return res;
      }
      return Promise.resolve(res);
    }
  };
}
// 创建 commit 和 dispatch instance
export default function createHelpers(actions, mutationsObj, emitter, getInstance) {
  const mutations = Object.assign({}, mutationsObj, innerMutation);
  return {
    commitGlobal: commitGlobal.bind(this),
    dispatchGlobal: dispatchGlobal.bind(this),
    commit(type, payload, innerHelper) {
      if (!type) {
        throw new Error(`not found ${type} action`);
      }
      if (isObject(type)) {
        payload = type;
        type = 'update';
      }
      if (isString(type) && startsWith(type, '$global:')) {
        const realType = type.split(':').pop();
        return commitGlobal.call(this, realType, payload);
      }
      const prevState = { ...this.data };
      const finalMutation = mutationHandler(mutations[type], wrapDataInstance(this.data), payload, innerHelper);
      // 触发更新机制
      emitter.emitEvent('updateState', { state: finalMutation, mutation: { type, payload }, prevState });
      // commit 的结果是一个同步行为，返回值
      return this.data;
    },
    async dispatch(type, payload) {
      const actionCache = Object.assign({}, actions, this);
      if (!type) {
        throw new Error('action type not found');
      }
      if (isString(type) && startsWith(type, '$global:')) {
        const realType = type.split(':').pop();
        return dispatchGlobal.call(this, realType, payload);
      }
      const actionFunc = actionCache[type];
      const self = this;
      let res = {};
      res = await dispatchActionPromise(emitter, { type, payload });
      if (!actionFunc) {
        console.warn('not found action', type, actions);
        return Promise.resolve(res);
      }
      res = await actionFunc.call(self, {
        commit: this.commit.bind(self),
        dispatch: this.dispatch.bind(self),
        dispatchGlobal: dispatchGlobal.bind(self),
        commitGlobal: commitGlobal.bind(self),
        message: myGlobal.messageManager,
        put: function (type, ...args) {
          const func = actionCache[type];
          if (!func) {
            throw new Error(`not found ${type} action`);
          }
          if (func) {
            func.apply(self, args);
          }
        },
        get state() {
          return wrapDataInstance(self.data, self);
        },
        get getters() {
          return wrapDataInstance(self.data.$getters, self);
        },
        get global() {
          return wrapDataInstance(self.data.$global);
        },
        getRef(name) {
          return myGlobal.getComponentRef(name);
        },
        getState(instanceName) {
          if (!instanceName) {
            return wrapDataInstance(self.data, self);
          }
          return myGlobal.getState(instanceName);
        },
        select(filter) {
          return filter(wrapDataInstance({ ...self.data }));
        }
      }, wrapDataInstance(payload));
      // 保证结果为一个 promise
      if (res instanceof Promise) {
        return res;
      }
      return Promise.resolve(res);
    }
  };
}
