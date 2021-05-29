function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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

var Store = /*#__PURE__*/function () {
  function Store(store, options) {
    this.$global = global;
    this.$emitter = new EventEmitter(); // 预处理配置转化

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
    this.watch = this.watch.bind(this);
  }

  var _proto = Store.prototype;

  _proto.getInstance = function getInstance() {
    return this.storeInstance;
  };

  _proto.watch = function watch(predicate, effect) {
    this.when(predicate, effect, true);
  } // 实现 mobx when
  ;

  _proto.when = function when(predicate, effect, isWatch) {
    var _this = this;

    var emitter = this.$emitter;
    if (!predicate) return Promise.reject();
    return new Promise(function (resolve) {
      var initialData = _this.storeInstance ? _this.storeInstance.data : {};

      if (predicate(initialData)) {
        if (effect) {
          effect.call(_this, initialData);
        }

        return resolve(initialData);
      }

      var dispose = emitter.addListener('updateState', function (_ref) {
        var state = _ref.state,
            mutation = _ref.mutation,
            prevState = _ref.prevState;
        var newData = setStoreDataByState(_this.storeInstance.data, state);
        var currentPageInstance = getCurrentPages().pop() || {};
        var instanceView = _this.storeInstance.$viewId || -1;
        var currentView = currentPageInstance.$viewId || -1; // 已经不在当前页面的不再触发

        if (instanceView === currentView) {
          if (predicate(newData)) {
            dispose();

            if (effect) {
              effect.call(_this, newData);
            }

            resolve(newData);
          }
        }
      });
    });
  } // 实现 store.subscribe
  ;

  _proto.subscribe = function subscribe(subscriber, actionSubscriber) {
    var _this2 = this;

    var emitter = this.$emitter;
    var originViewInstance = getCurrentPages().pop() || {};

    if (subscriber) {
      this.storeUpdateLisitenerDispose = emitter.addListener('updateState', function (_ref2) {
        var state = _ref2.state,
            mutation = _ref2.mutation,
            prevState = _ref2.prevState;
        var currentPageInstance = getCurrentPages().pop() || {};
        var instanceView = originViewInstance.$viewId || -1;
        var currentView = currentPageInstance.$viewId || -1; // 已经不在当前页面的不再触发

        if (instanceView === currentView) {
          subscriber(mutation, wrapState(_extends({}, _this2.storeInstance.data)), wrapState(_extends({}, prevState)));
        }
      });
    }

    if (actionSubscriber) {
      this.storeDispatchActionLisitenerDispose = emitter.addListener('dispatchAction', function (action, next) {
        actionSubscriber(action, next);
      });
    }
  };

  _proto.subscribeAction = function subscribeAction(actionSubscriber) {
    var emitter = this.$emitter;
    var originViewInstance = getCurrentPages().pop() || {};

    if (actionSubscriber) {
      emitter.addListener('dispatchAction', function (action, next) {
        var currentPageInstance = getCurrentPages().pop() || {};
        var instanceView = originViewInstance.$viewId || -1;
        var currentView = currentPageInstance.$viewId || -1;

        if (instanceView === currentView) {
          return actionSubscriber(action, next);
        }
      });
    }
  };

  _proto.use = function use(option) {
    if (option === void 0) {
      option = defaultMixin;
    }

    if (isFunc(option)) {
      return option.call(this, this.register, global);
    } else {
      return this.register(option);
    }
  };

  _proto.register = function register(config) {
    if (config === void 0) {
      config = {};
    }

    var that = this;
    config.data = config.data || {};
    Object.assign(config.data, this.stateConfig, config.state);

    var initialState = _extends({}, config.data);

    var originOnLoad = config.onLoad;
    var originOnUnload = config.onUnload;
    var originOnShow = config.onShow;
    var originOnHide = config.onHide;
    var emitter = this.$emitter; // mappers

    if (config.mapActionsToMethod) {
      mapActionsToMethod(config.mapActionsToMethod, this.actions, config);
    }

    if (config.methods) {
      mapMutationsToMethod(config.methods, config);
    }

    if (config.mapMutationsToMethod) {
      mapMutationsToMethod(config.mapMutationsToMethod, config);
    }

    config.onHide = function () {
      var currentPageInstance = getCurrentPages().pop() || {};
      global.emitter.emitEvent('updateCurrentPath', {
        from: getPath(currentPageInstance.route),
        fromViewId: currentPageInstance.$viewId || -1
      });
      originOnHide && originOnHide.apply(this, arguments);
      this._isHided = true;
    };

    config.onUnload = function () {
      var currentPageInstance = getCurrentPages().pop() || {};
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

    config.onShow = function (d) {
      var currentPageInstance = getCurrentPages().pop() || {}; // 消费 Resume 字段

      var resumeData = global.messageManager.pop('$RESUME') || {};
      global.emitter.emitEvent('updateCurrentPath', Object.assign(currentPageInstance.$routeConfig || {}, {
        currentPath: getPath(currentPageInstance.route),
        context: resumeData
      })); // 如果有开全局，先触发

      if (that.connectGlobal) {
        // sync global data
        emitter.emitEvent('updateState', {
          state: _extends({}, this.data, {
            $global: _extends({}, this.data.$global, global.getGlobalState(this.mapGlobals))
          }),
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

    config.onLoad = function (query) {
      var _this3 = this;

      var onloadInstance = this;
      this.$emitter = emitter;
      this.$globalEmitter = global.emitter;
      this.$message = global.messageManager;
      this.$store = that;
      this.$when = that.when; // 先榜上更新 store 的 监听器

      this.herculexUpdateLisitener = emitter.addListener('updateState', function (_ref3) {
        var state = _ref3.state;
        var newData = setStoreDataByState(_this3.data, state);
        var currentPageInstance = getCurrentPages().pop() || {};
        var instanceView = onloadInstance.$viewId || -1;
        var currentView = currentPageInstance.$viewId || -1; // 已经不在当前页面的不再触发

        if (instanceView === currentView) {
          _this3.setData(newData);
        }
      });

      if (that.connectGlobal) {
        // 立马触发同步
        emitter.emitEvent('updateState', {
          state: _extends({}, this.data, {
            $global: _extends({}, this.data.$global, global.getGlobalState(this.mapGlobals))
          }),
          mutation: {
            type: 'sync_global_data'
          },
          prevState: this.data
        }); // 增加nextprops的关联

        this.herculexUpdateLisitenerGlobal = global.emitter.addListener('updateGlobalStore', function () {
          var currentPageInstance = getCurrentPages().pop() || {};
          var instanceView = onloadInstance.$viewId || -1;
          var currentView = currentPageInstance.$viewId || -1; // 已经不在当前页面的不再触发

          if (instanceView !== currentView) return;
          emitter.emitEvent('updateState', {
            state: _extends({}, _this3.data, {
              $global: _extends({}, _this3.data.$global, global.getGlobalState(_this3.mapGlobals))
            }),
            mutation: {
              type: 'sync_global_data'
            },
            prevState: _this3.data
          });
        });
      }

      this.subscribe = that.subscribe;
      this.subscribeAction = that.subscribeAction; // 设置页面 path 和 query

      var currentPageInstance = getCurrentPages().pop() || {};
      var currentPath = getPath(currentPageInstance.route); // 外面携带的数据

      var contextData = global.messageManager.pop('$RESUME') || {};
      var viewId = currentPageInstance.$viewId || -1;
      this.$routeConfig = {
        currentPath: currentPath,
        query: query,
        context: contextData,
        viewId: viewId
      };
      global.emitter.emitEvent('updateCurrentPath', this.$routeConfig); // query.$context = loadData;

      that.storeInstance = this;
      var name = that.instanceName || currentPath || viewId || -1; // 把命名空间灌到实例

      this.instanceName = name;
      global.registerInstance(name, {
        config: {
          actions: that.actions,
          mutations: that.mutations,
          state: initialState
        },
        store: that,
        name: name,
        currentPath: currentPath,
        viewId: viewId
      });

      if (that.plugins) {
        that.plugins.forEach(function (element) {
          var pluginFunc = isString(element) ? _innerPlugins[element] : element;
          pluginFunc(that.storeInstance);
        });
      } // 绑定属性关系


      Object.defineProperty(this, 'state', {
        get: function get() {
          return wrapDataInstance(this.data);
        }
      });
      this.$getters = wrapDataInstance(this.state.$getters); // this.$global = wrapDataInstance({ ...this.state.$global });
      // 获取其他 store 的只读数据

      this.$getState = function (name) {
        if (!name) return this.state;
        return global.getState(name);
      };

      this.$getRef = function (name) {
        return global.getComponentRef(name);
      };

      if (originOnLoad) {
        originOnLoad.call(this, query, contextData);
      }
    };

    return _extends({}, config, createHelpers.call(this, that.actions, that.mutations, that.$emitter));
  } // connect(options) {
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
  ;

  return Store;
}();

export default Store;
export { connect, GlobalStore };