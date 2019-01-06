import { isString, isArray, isFunc } from './utils/is';
import EventEmitter from './emitter';
import _innerPlugins from './innerPlugins';
import mapGettersToState from './mapGettersToState';
import createHelpers, { createConnectHelpers } from './createHelpers';
import { setDataByStateProps, setStoreDataByState } from './dataTransform';
import wrapDataInstance from './wrapDataInstance';
import global from './global';
import connect from './connect';
import GlobalStore from './provider';
import { mapActionsToMethod, mapMutationsToMethod } from './mapHelpersToMethod';
import configPreHandler from './storeConfigPreHandle';
import wrapState from './utils/wrapState';
import defaultMixin from './mixins/default';
import './polyfill/index';

function getPath(link) {
  return isString(link) && link.split('/')[1];
}
class Store {
  constructor(store, options) {
    this.$global = global;
    this.$emitter = new EventEmitter();
    // 预处理配置转化
    configPreHandler(store);
    Object.assign(this, {
      connectGlobal: store.connectGlobal,
      mapGlobals: store.mapGlobals,
      actions: store.actions,
      methods: store.methods || {},
      mutations: store.mutations || {},
      plugins: store.plugins || [],
      getters: store.getters || {},
      instanceName: store.namespace || store.instanceName
    });
    this.stateConfig = mapGettersToState(store.state || {}, this.getters, this);
    this.stateConfig.$global = this.connectGlobal ? global.getGlobalState(this.mapGlobals) : {};
    this.subscribe = this.subscribe.bind(this);
    this.register = this.register.bind(this);
    this.subscribeAction = this.subscribeAction.bind(this);
    this.when = this.when.bind(this);
  }
  getCurrentPages() {
    // 对currentpage的实现
    return typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  }
  getInstance() {
    return this.storeInstance;
  }
  // 实现 mobx when
  when (predicate, effect) {
    const emitter = this.$emitter;
    if (!predicate) return Promise.reject();
    return new Promise((resolve) => {
      const initialData = this.storeInstance ? this.storeInstance.data : {};
      if (predicate(initialData)) {
        if (effect) {
          effect.call(this, initialData);
        }
        return resolve(initialData);
      }
      const lisitener = emitter.addListener('updateState', ({ state, mutation, prevState }) => {
        const newData = setStoreDataByState(this.storeInstance.data, state);
        const currentPageInstance = this.getCurrentPages().slice().pop() || {};
        const instanceView = this.storeInstance.$viewId || -1;
        const currentView = currentPageInstance.$viewId || -1;
        // 已经不在当前页面的不再触发
        if (instanceView === currentView) {
          if (predicate(newData)) {
            if (effect) {
              effect.call(this, newData);
            }
            resolve(newData);
            emitter.removeListener('updateState', lisitener);
          }
        }
      });
    });
  }
  // 实现 store.subscribe
  subscribe (subscriber, actionSubscriber) {
    const emitter = this.$emitter;
    const originViewInstance = this.getCurrentPages().slice().pop() || {};
    if (subscriber) {
      this.storeUpdateLisitenerDispose = emitter.addListener('updateState', ({ state, mutation, prevState }) => {
        const currentPageInstance = this.getCurrentPages().slice().pop() || {};
        const instanceView = originViewInstance.$viewId || -1;
        const currentView = currentPageInstance.$viewId || -1;
        // 已经不在当前页面的不再触发
        if (instanceView === currentView) {
          subscriber(mutation, wrapState({ ...this.storeInstance.data }), wrapState({ ...prevState }));
        }
      });
    }
    if (actionSubscriber) {
      this.storeDispatchActionLisitenerDispose = emitter.addListener('dispatchAction', (action, next) => {
        actionSubscriber(action, next);
      });
    }
  };
  subscribeAction(actionSubscriber) {
    const emitter = this.$emitter;
    const originViewInstance = this.getCurrentPages().slice().pop() || {};
    if (actionSubscriber) {
      emitter.addListener('dispatchAction', (action, next) => {
        const currentPageInstance = this.getCurrentPages().slice().pop() || {};
        const instanceView = originViewInstance.$viewId || -1;
        const currentView = currentPageInstance.$viewId || -1;
        if (instanceView === currentView) {
          return actionSubscriber(action, next);
        }
      });
    }
  }
  use(option = defaultMixin) {
    if (isFunc(option)) {
      return option.call(this, this.register, global);
    } else {
      return this.register(option);
    }
  }
  register(config = {}) {
    const that = this;
    config.data = config.data || {};
    Object.assign(config.data, this.stateConfig, config.state);
    const initialState = { ...config.data };
    const originOnLoad = config.onLoad;
    const originOnUnload = config.onUnload;
    const originOnShow = config.onShow;
    const originOnHide = config.onHide;
    const originOnReady = config.onReady;
    const emitter = this.$emitter;
    // mappers
    if (config.mapActionsToMethod) {
      mapActionsToMethod(config.mapActionsToMethod, this.actions, config);
    }
    if (config.methods) {
      mapMutationsToMethod(config.methods, config);
    }
    if (config.mapMutationsToMethod) {
      mapMutationsToMethod(config.mapMutationsToMethod, config);
    }
    config.onHide = function() {
      const currentPageInstance = that.getCurrentPages().slice().pop() || {};
      global.emitter.emitEvent('updateCurrentPath', {
        from: getPath(currentPageInstance.route),
        fromViewId: currentPageInstance.$viewId || -1
      });
      originOnHide && originOnHide.apply(this, arguments);
      this._isHided = true;
    };
    config.onUnload = function() {
      const currentPageInstance = that.getCurrentPages().slice().pop() || {};
      global.emitter.emitEvent('updateCurrentPath', {
        from: getPath(currentPageInstance.route)
      });
      this.herculexUpdateLisitener && this.herculexUpdateLisitener();
      this.herculexUpdateLisitenerGlobal && this.herculexUpdateLisitenerGlobal();
      if (this.$store) {
        this.$store.storeUpdateLisitenerDispose && this.$store.storeUpdateLisitenerDispose();
        this.$store.storeDispatchActionLisitenerDispose && this.$store.storeDispatchActionLisitenerDispose();
      }
      originOnUnload && originOnUnload.apply(this, arguments);
    };
    config.onShow = function(d) {
      const currentPageInstance = that.getCurrentPages().slice().pop() || {};
      // 消费 Resume 字段
      const resumeData = global.messageManager.pop('$RESUME') || {};
      global.emitter.emitEvent('updateCurrentPath', Object.assign(currentPageInstance.$routeConfig || {}, {
        currentPath: getPath(currentPageInstance.route),
        context: resumeData
      }));
      // 如果有开全局，先触发
      if (that.connectGlobal) {
        // sync global data
        emitter.emitEvent('updateState', {
          state: {
            ...this.data,
            $global: {
              ...this.data.$global,
              ...global.getGlobalState(this.mapGlobals)
            }
          },
          mutation: {
            type: 'sync_global_data'
          },
          prevState: this.data
        });
      }
      originOnShow && originOnShow.apply(this, arguments);
      if (this._isHided) {
        config.onResume && config.onResume.call(this, Object.assign({}, d, resumeData));
        this._isHided = false;
      }
    };
    config.onLoad = function(query) {
      const onloadInstance = this;
      this.$emitter = emitter;
      this.$globalEmitter = global.emitter;
      this.$message = global.messageManager;
      this.$store = that;
      this.$when = that.when;
      console.log('eee', that.getCurrentPages());
        // 先榜上更新 store 的 监听器
      this.herculexUpdateLisitener = emitter.addListener('updateState', ({ state }) => {
        const newData = setStoreDataByState(this.data, state);
        const currentPageInstance = that.getCurrentPages().slice().pop() || {};
        const instanceView = onloadInstance.$viewId || -1;
        const currentView = currentPageInstance.$viewId || -1;
        // 已经不在当前页面的不再触发
        if (instanceView === currentView || (currentView === -1)) {
          this.setData(newData);
        }
      });
      if (that.connectGlobal) {
       // 立马触发同步
        emitter.emitEvent('updateState', {
          state: {
            ...this.data,
            $global: {
              ...this.data.$global,
              ...global.getGlobalState(this.mapGlobals)
            }
          },
          mutation: {
            type: 'sync_global_data'
          },
          prevState: this.data
        });

        // 增加nextprops的关联
        this.herculexUpdateLisitenerGlobal = global.emitter.addListener('updateGlobalStore', () => {
          const currentPageInstance = that.getCurrentPages().slice().pop() || {};
          const instanceView = onloadInstance.$viewId || -1;
          const currentView = currentPageInstance.$viewId || -1;
          // 已经不在当前页面的不再触发
          if (instanceView !== currentView && currentView !== -1) return;
          emitter.emitEvent('updateState', {
            state: {
              ...this.data,
              $global: {
                ...this.data.$global,
                ...global.getGlobalState(this.mapGlobals)
              }
            },
            mutation: {
              type: 'sync_global_data'
            },
            prevState: this.data
          });
        });
      }
      this.subscribe = that.subscribe;
      this.subscribeAction = that.subscribeAction;
      // 设置页面 path 和 query
      const currentPageInstance = that.getCurrentPages().slice().pop() || {};
      const currentPath = getPath(currentPageInstance.route);
      // 外面携带的数据
      const contextData = global.messageManager.pop('$RESUME') || {};
      const viewId = currentPageInstance.$viewId || -1;
      this.$routeConfig = {
        currentPath,
        query,
        context: contextData,
        viewId
      };
      global.emitter.emitEvent('updateCurrentPath', this.$routeConfig);
      // query.$context = loadData;
      that.storeInstance = this;
      const name = that.instanceName || currentPath || viewId || -1;
      // 把命名空间灌到实例
      this.instanceName = name;
      // TODO 检查是否影响支付宝小程序
      // if (name !== -1) {
      //   global.registerInstance(name, {
      //     config: { actions: that.actions, mutations: that.mutations, state: initialState },
      //     store: that,
      //     name,
      //     currentPath,
      //     viewId
      //   });
      // }
      if (that.plugins) {
        that.plugins.forEach(element => {
          const pluginFunc = isString(element) ? _innerPlugins[element] : element;
          pluginFunc(that.storeInstance);
        });
      }
      // 绑定属性关系
      Object.defineProperty(this, 'state', {
        get: function() { return wrapDataInstance(this.data); }
      });
      this.$getters = wrapDataInstance(this.state.$getters);
      this.$global = wrapDataInstance({ ...this.state.$global });
      // 获取其他 store 的只读数据
      this.$getState = function(name) {
        if (!name) return this.state;
        return global.getState(name);
      };
      this.$getRef = function(name) {
        return global.getComponentRef(name);
      };

      if (originOnLoad) {
        originOnLoad.call(this, query, contextData);
      }
    };
    config.onReady = function() {
      const currentPageInstance = that.getCurrentPages().slice().pop() || {};
      const currentPath = getPath(currentPageInstance.route);
      const viewId = currentPageInstance.$viewId || -1;
      const name = that.instanceName || currentPath || viewId || -1;
      if (!global.getInstance(name) && name !== -1) {
        global.registerInstance(name, {
          config: { actions: that.actions, mutations: that.mutations, state: initialState },
          store: that,
          name,
          currentPath,
          viewId
        });
      }
      originOnReady && originOnReady.apply(this, arguments);
    };
    return {
      ...config,
      ...createHelpers.call(this, that.actions, that.mutations, that.$emitter)
    };
  }
  connect(options) {
    console.log('optopns', options);
    const targetInstanceObj = {
      // name: ''
      store: this,
      config: {
        actions: this.actions,
        mutations: this.mutations,
        state: this.stateConfig,
        getters: this.getters
      },
      getInstance() {
        return this.store;
      }
    };
    return connect(options, targetInstanceObj);
  }
  // connect(options) {
  //   const { mapStateToProps = [], mapGettersToProps } = options;
  //   const that = this;
  //   return function (config) {
  //     const _didMount = config.didMount;
  //     Object.assign(that.mutations, config.mutations || {});
  //     return {
  //       ...config,
  //       methods: {
  //         ...config.methods,
  //         ...createConnectHelpers.call(this, that)
  //       },
  //       didMount() {
  //         const initialData = setDataByStateProps(mapStateToProps, that.getInstance().data, config, mapGettersToProps);
  //         this.setData(initialData);
  //         if (mapStateToProps) {
  //           that.$emitter.addListener('updateState', ({state = {}}) => {
  //             const nextData = setDataByStateProps(mapStateToProps, state, config, mapGettersToProps);
  //             this.setData(nextData);
  //           });
  //         }
  //         if (typeof _didMount === 'function') {
  //           _didMount.call(this);
  //         }
  //       }
  //     };
  //   };
  // }
}

export default Store;
export {
  connect,
  GlobalStore
};
