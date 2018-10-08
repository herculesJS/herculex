'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GlobalStore = exports.connect = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _is = require('./utils/is');

var _emitter = require('./emitter');

var _emitter2 = _interopRequireDefault(_emitter);

var _innerPlugins2 = require('./innerPlugins');

var _innerPlugins3 = _interopRequireDefault(_innerPlugins2);

var _mapGettersToState = require('./mapGettersToState');

var _mapGettersToState2 = _interopRequireDefault(_mapGettersToState);

var _createHelpers = require('./createHelpers');

var _createHelpers2 = _interopRequireDefault(_createHelpers);

var _dataTransform = require('./dataTransform');

var _wrapDataInstance = require('./wrapDataInstance');

var _wrapDataInstance2 = _interopRequireDefault(_wrapDataInstance);

var _global = require('./global');

var _global2 = _interopRequireDefault(_global);

var _connect = require('./connect');

var _connect2 = _interopRequireDefault(_connect);

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

var _mapHelpersToMethod = require('./mapHelpersToMethod');

var _storeConfigPreHandle = require('./storeConfigPreHandle');

var _storeConfigPreHandle2 = _interopRequireDefault(_storeConfigPreHandle);

var _wrapState = require('./utils/wrapState');

var _wrapState2 = _interopRequireDefault(_wrapState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getPath(link) {
  return (0, _is.isString)(link) && link.split('/')[1];
}

var Store = function () {
  function Store(store, options) {
    _classCallCheck(this, Store);

    this.$global = _global2.default;
    this.$emitter = new _emitter2.default();
    // 预处理配置转化
    (0, _storeConfigPreHandle2.default)(store);
    (0, _assign2.default)(this, {
      connectGlobal: store.connectGlobal,
      mapGlobals: store.mapGlobals,
      actions: store.actions,
      mutations: store.mutations || {},
      plugins: store.plugins || [],
      getters: store.getters || {},
      instanceName: store.namespace || store.instanceName
    });
    this.stateConfig = (0, _mapGettersToState2.default)(store.state || {}, this.getters, this);
    this.stateConfig.$global = this.connectGlobal ? _global2.default.getGlobalState(this.mapGlobals) : {};
  }

  Store.prototype.getInstance = function getInstance() {
    return this.storeInstance;
  };

  Store.prototype.register = function register(config) {
    var that = this;
    config.data = config.data || {};
    (0, _assign2.default)(config.data, this.stateConfig, config.state);
    var initialState = _extends({}, config.data);
    var originOnLoad = config.onLoad;
    var originOnUnload = config.onUnload;
    var originOnShow = config.onShow;
    var originOnHide = config.onHide;
    var emitter = this.$emitter;
    // mappers
    if (config.mapActionsToMethod) {
      (0, _mapHelpersToMethod.mapActionsToMethod)(config.mapActionsToMethod, this.actions, config);
    }
    if (config.mapMutationsToMethod) {
      (0, _mapHelpersToMethod.mapMutationsToMethod)(config.mapMutationsToMethod, config);
    }
    config.onHide = function () {
      var currentPageInstance = getCurrentPages().pop() || {};
      _global2.default.emitter.emitEvent('updateCurrentPath', {
        from: getPath(currentPageInstance.route),
        fromViewId: currentPageInstance.$viewId || -1
      });
      originOnHide && originOnHide.apply(this, arguments);
      this._isHided = true;
    };
    config.onUnload = function () {
      var currentPageInstance = getCurrentPages().pop() || {};
      _global2.default.emitter.emitEvent('updateCurrentPath', {
        from: getPath(currentPageInstance.route)
      });
      originOnUnload && originOnUnload.apply(this, arguments);
    };
    config.onShow = function (d) {
      var currentPageInstance = getCurrentPages().pop() || {};
      // 消费 Resume 字段
      var resumeData = _global2.default.messageManager.pop('$RESUME') || {};
      _global2.default.emitter.emitEvent('updateCurrentPath', {
        currentPath: getPath(currentPageInstance.route),
        context: resumeData
      });
      // 如果有开全局，先触发
      if (that.connectGlobal) {
        // sync global data
        emitter.emitEvent('updateState', {
          state: _extends({}, this.data, {
            $global: _extends({}, this.data.$global, _global2.default.getGlobalState(this.mapGlobals))
          }),
          mutation: {
            type: 'sync_global_data'
          },
          prevState: this.data
        });
      }
      originOnShow && originOnShow.apply(this, arguments);
      if (this._isHided) {
        config.onResume && config.onResume.call(this, (0, _assign2.default)({}, d, resumeData));
        this._isHided = false;
      }
    };
    config.onLoad = function () {
      var _this = this;

      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var onloadInstance = this;
      this.$emitter = emitter;
      this.$globalEmitter = _global2.default.emitter;
      this.$message = _global2.default.messageManager;
      // 先榜上更新 store 的 监听器
      emitter.addListener('updateState', function (_ref) {
        var state = _ref.state;

        var newData = (0, _dataTransform.setStoreDataByState)(_this.data, state);
        var currentPageInstance = getCurrentPages().pop() || {};
        var instanceView = onloadInstance.$viewId || -1;
        var currentView = currentPageInstance.$viewId || -1;
        // 已经不在当前页面的不再触发
        if (instanceView === currentView) {
          _this.setData(newData);
        }
      });
      if (that.connectGlobal) {
        // 立马触发同步
        emitter.emitEvent('updateState', {
          state: _extends({}, this.data, {
            $global: _extends({}, this.data.$global, _global2.default.getGlobalState(this.mapGlobals))
          }),
          mutation: {
            type: 'sync_global_data'
          },
          prevState: this.data
        });

        // 增加nextprops的关联
        _global2.default.emitter.addListener('updateGlobalStore', function () {
          var currentPageInstance = getCurrentPages().pop() || {};
          var instanceView = onloadInstance.$viewId || -1;
          var currentView = currentPageInstance.$viewId || -1;
          // 已经不在当前页面的不再触发
          if (instanceView !== currentView) return;
          emitter.emitEvent('updateState', {
            state: _extends({}, _this.data, {
              $global: _extends({}, _this.data.$global, _global2.default.getGlobalState(_this.mapGlobals))
            }),
            mutation: {
              type: 'sync_global_data'
            },
            prevState: _this.data
          });
        });
      }
      this.subscribe = function (subscriber, actionSubscriber) {
        emitter.addListener('updateState', function (_ref2) {
          var state = _ref2.state,
              mutation = _ref2.mutation,
              prevState = _ref2.prevState;

          console.log('newState', state, getCurrentPages(), instanceView);
          var currentPageInstance = getCurrentPages().pop() || {};
          var instanceView = onloadInstance.$viewId || -1;
          var currentView = currentPageInstance.$viewId || -1;
          // 已经不在当前页面的不再触发
          if (instanceView === currentView) {
            subscriber(mutation, (0, _wrapState2.default)(_extends({}, onloadInstance.data)), (0, _wrapState2.default)(_extends({}, prevState)));
          }
        });
        if (actionSubscriber) {
          emitter.addListener('dispatchAction', function (action) {
            actionSubscriber(action);
          });
        }
      };
      // 设置页面 path 和 query
      var currentPageInstance = getCurrentPages().pop() || {};
      var currentPath = getPath(currentPageInstance.route);
      // 外面携带的数据
      var loadData = _global2.default.messageManager.pop('$RESUME') || {};
      var viewId = currentPageInstance.$viewId || -1;
      _global2.default.emitter.emitEvent('updateCurrentPath', {
        currentPath: currentPath,
        query: query,
        context: loadData,
        viewId: viewId
      });
      query.$context = loadData;
      that.storeInstance = this;
      var name = that.instanceName || currentPath || viewId || -1;
      // 把命名空间灌到实例
      this.instanceName = name;
      _global2.default.registerInstance(name, {
        config: { actions: that.actions, mutations: that.mutations, state: initialState },
        store: that,
        name: name,
        currentPath: currentPath,
        viewId: viewId
      });
      if (that.plugins) {
        that.plugins.forEach(function (element) {
          var pluginFunc = (0, _is.isString)(element) ? _innerPlugins3.default[element] : element;
          pluginFunc(that.storeInstance);
        });
      }
      // 绑定属性关系
      Object.defineProperty(this, 'state', {
        get: function get() {
          return (0, _wrapDataInstance2.default)(this.data);
        }
      });
      this.$getters = (0, _wrapDataInstance2.default)(_extends({}, this.state.$getters));
      this.$global = (0, _wrapDataInstance2.default)(_extends({}, this.state.$global));
      // 获取其他 store 的只读数据
      this.$getState = function (name) {
        if (!name) return this.state;
        return _global2.default.getState(name);
      };
      this.$getRef = function (name) {
        return _global2.default.getComponentRef(name);
      };

      if (originOnLoad) {
        originOnLoad.apply(this, arguments);
      }
    };
    return _extends({}, config, _createHelpers2.default.call(this, that.actions, that.mutations, that.$emitter));
  };

  Store.prototype.connect = function connect(options) {
    var _options$mapStateToPr = options.mapStateToProps,
        mapStateToProps = _options$mapStateToPr === undefined ? [] : _options$mapStateToPr,
        mapGettersToProps = options.mapGettersToProps;

    var that = this;
    return function (config) {
      var _didMount = config.didMount;
      (0, _assign2.default)(that.mutations, config.mutations || {});
      return _extends({}, config, {
        methods: _extends({}, config.methods, _createHelpers.createConnectHelpers.call(this, that)),
        didMount: function didMount() {
          var _this2 = this;

          var initialData = (0, _dataTransform.setDataByStateProps)(mapStateToProps, that.getInstance().data, config, mapGettersToProps);
          this.setData(initialData);
          if (mapStateToProps) {
            that.$emitter.addListener('updateState', function (_ref3) {
              var _ref3$state = _ref3.state,
                  state = _ref3$state === undefined ? {} : _ref3$state;

              var nextData = (0, _dataTransform.setDataByStateProps)(mapStateToProps, state, config, mapGettersToProps);
              _this2.setData(nextData);
            });
          }
          if (typeof _didMount === 'function') {
            _didMount.call(this);
          }
        }
      });
    };
  };

  return Store;
}();

exports.default = Store;
exports.connect = _connect2.default;
exports.GlobalStore = _provider2.default;