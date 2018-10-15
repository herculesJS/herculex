import { isString, isArray } from './utils/is';
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
      mutations: store.mutations || {},
      plugins: store.plugins || [],
      getters: store.getters || {},
      instanceName: store.namespace || store.instanceName
    });
    this.stateConfig = mapGettersToState(store.state || {}, this.getters, this);
    this.stateConfig.$global = this.connectGlobal ? global.getGlobalState(this.mapGlobals) : {};
  }
  getInstance() {
    return this.storeInstance;
  }
  register(config) {
    const that = this;
    config.data = config.data || {};
    Object.assign(config.data, this.stateConfig, config.state);
    const initialState = { ...config.data };
    const originOnLoad = config.onLoad;
    const originOnUnload = config.onUnload;
    const originOnShow = config.onShow;
    const originOnHide = config.onHide;
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
      const currentPageInstance = getCurrentPages().pop() || {};
      global.emitter.emitEvent('updateCurrentPath', {
        from: getPath(currentPageInstance.route),
        fromViewId: currentPageInstance.$viewId || -1
      });
      originOnHide && originOnHide.apply(this, arguments);
      this._isHided = true;
    };
    config.onUnload = function() {
      const currentPageInstance = getCurrentPages().pop() || {};
      global.emitter.emitEvent('updateCurrentPath', {
        from: getPath(currentPageInstance.route)
      });
      originOnUnload && originOnUnload.apply(this, arguments);
    };
    config.onShow = function(d) {
      const currentPageInstance = getCurrentPages().pop() || {};
      // 消费 Resume 字段
      const resumeData = global.messageManager.pop('$RESUME') || {};
      global.emitter.emitEvent('updateCurrentPath', {
        currentPath: getPath(currentPageInstance.route),
        context: resumeData
      });
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
    config.onLoad = function(query = {}) {
      const onloadInstance = this;
      this.$emitter = emitter;
      this.$globalEmitter = global.emitter;
      this.$message = global.messageManager;
        // 先榜上更新 store 的 监听器
      emitter.addListener('updateState', ({ state }) => {
        const newData = setStoreDataByState(this.data, state);
        const currentPageInstance = getCurrentPages().pop() || {};
        const instanceView = onloadInstance.$viewId || -1;
        const currentView = currentPageInstance.$viewId || -1;
        // 已经不在当前页面的不再触发
        if (instanceView === currentView) {
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
        global.emitter.addListener('updateGlobalStore', () => {
          const currentPageInstance = getCurrentPages().pop() || {};
          const instanceView = onloadInstance.$viewId || -1;
          const currentView = currentPageInstance.$viewId || -1;
          // 已经不在当前页面的不再触发
          if (instanceView !== currentView) return;
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
      this.subscribe = function(subscriber, actionSubscriber) {
        emitter.addListener('updateState', ({ state, mutation, prevState }) => {
          const currentPageInstance = getCurrentPages().pop() || {};
          const instanceView = onloadInstance.$viewId || -1;
          const currentView = currentPageInstance.$viewId || -1;
          // 已经不在当前页面的不再触发
          if (instanceView === currentView) {
            subscriber(mutation, wrapState({ ...onloadInstance.data }), wrapState({ ...prevState }));
          }
        });
        if (actionSubscriber) {
          emitter.addListener('dispatchAction', (action) => {
            actionSubscriber(action);
          });
        }
      };
      // 设置页面 path 和 query
      const currentPageInstance = getCurrentPages().pop() || {};
      const currentPath = getPath(currentPageInstance.route);
      // 外面携带的数据
      const loadData = global.messageManager.pop('$RESUME') || {};
      const viewId = currentPageInstance.$viewId || -1;
      global.emitter.emitEvent('updateCurrentPath', {
        currentPath,
        query,
        context: loadData,
        viewId
      });
      query.$context = loadData;
      that.storeInstance = this;
      const name = that.instanceName || currentPath || viewId || -1;
      // 把命名空间灌到实例
      this.instanceName = name;
      global.registerInstance(name, {
        config: { actions: that.actions, mutations: that.mutations, state: initialState },
        store: that,
        name,
        currentPath,
        viewId
      });
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
        originOnLoad.apply(this, arguments);
      }
    };
    return {
      ...config,
      ...createHelpers.call(this, that.actions, that.mutations, that.$emitter)
    };
  }
  connect(options) {
    const { mapStateToProps = [], mapGettersToProps } = options;
    const that = this;
    return function (config) {
      const _didMount = config.didMount;
      Object.assign(that.mutations, config.mutations || {});
      return {
        ...config,
        methods: {
          ...config.methods,
          ...createConnectHelpers.call(this, that)
        },
        didMount() {
          const initialData = setDataByStateProps(mapStateToProps, that.getInstance().data, config, mapGettersToProps);
          this.setData(initialData);
          if (mapStateToProps) {
            that.$emitter.addListener('updateState', ({state = {}}) => {
              const nextData = setDataByStateProps(mapStateToProps, state, config, mapGettersToProps);
              this.setData(nextData);
            });
          }
          if (typeof _didMount === 'function') {
            _didMount.call(this);
          }
        }
      };
    };
  }
}

export default Store;
export {
  connect,
  GlobalStore
};
