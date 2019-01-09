'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = connect;

var _createHelpers = require('./createHelpers');

var _dataTransform = require('./dataTransform');

var _mapHelpersToMethod = require('./mapHelpersToMethod');

var _is = require('./utils/is');

var _global = require('./global');

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPath(link) {
  var number = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  return (0, _is.isString)(link) && link.split('/')[number];
}

var defaultConfig = {
  data: {},
  props: {},
  methods: {}
};

function getTargetInstance() {}
function connect(options, directTargetInstanceObj) {
  var name = options.name,
      _options$mapStateToPr = options.mapStateToProps,
      mapStateToProps = _options$mapStateToPr === undefined ? [] : _options$mapStateToPr,
      _options$mapGettersTo = options.mapGettersToProps,
      mapGettersToProps = _options$mapGettersTo === undefined ? [] : _options$mapGettersTo,
      _options$instanceName = options.instanceName,
      instanceName = _options$instanceName === undefined ? '' : _options$instanceName,
      namespace = options.namespace,
      _options$data = options.data,
      data = _options$data === undefined ? {} : _options$data,
      _options$props = options.props,
      props = _options$props === undefined ? {} : _options$props;

  return function () {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultConfig;

    config.data = config.data || {};
    config.props = config.props || {};
    config.methods = config.methods || {};
    if (options.mapActionsToMethod) {
      (0, _mapHelpersToMethod.mapActionsToMethod)(options.mapActionsToMethod, false, config.methods);
    }
    if (options.methods) {
      (0, _mapHelpersToMethod.mapMutationsToMethod)(options.methods, config.methods);
    }
    if (options.mapMutationsToMethod) {
      (0, _mapHelpersToMethod.mapMutationsToMethod)(options.mapMutationsToMethod, config.methods);
    }
    var _didMount = config.didMount;
    var _didUnMount = config.didUnmount;
    var key = namespace || instanceName;
    (0, _assign2.default)(config.data, data);
    (0, _assign2.default)(config.props, props);
    return _extends({}, config, {
      methods: _extends({}, config.methods, _createHelpers.createConnectHelpers.call(_global2.default, _global2.default, key, config, directTargetInstanceObj)),
      didMount: function didMount() {
        var that = this;
        // 组件可以添加 $ref 来拿相应的实例
        var propsRef = this.props.$ref;
        var propsNamespace = this.props.$namespace;
        var targetInstanceObj = void 0;
        var key = propsNamespace || namespace || instanceName || _global2.default.getCurrentPath() || _global2.default.getCurrentViewId() || -1;
        if (this.$page) {
          var _store = this.$page.$store;
          targetInstanceObj = {
            config: _store.actions,
            currentPath: getPath(this.$page.route),
            name: getPath(this.$page.route),
            store: _store
          };
        } else if (directTargetInstanceObj) {
          targetInstanceObj = _extends({}, directTargetInstanceObj);
        } else {
          targetInstanceObj = _global2.default.getInstance(key);
        }
        if (!targetInstanceObj && typeof _didMount === 'function') {
          console.warn('未绑定 store');
          _didMount.call(this);
          return;
        }
        // 当前component表达
        var componentIs = name || !directTargetInstanceObj && getPath(this.is, 2) || 'unknown';
        var currentStore = targetInstanceObj.store.getInstance();
        var currentRoute = currentStore.namespace || currentStore.instanceName || currentStore.route || '';
        // console.info(`${componentIs} 组件已关联 ${currentRoute}_${key} 的 store`, targetInstanceObj);
        (0, _assign2.default)(this, {
          storeConfig: targetInstanceObj.config,
          storeInstance: targetInstanceObj.store
        });
        this.$emitter = _global2.default.emitter;
        var store = targetInstanceObj.store;
        this.$store = store;
        var initialData = _dataTransform.setDataByStateProps.call(that, mapStateToProps, store.getInstance().data, config, mapGettersToProps, store.getInstance());
        this.setData(initialData);
        // 自动注册进 components 实例, propsRef 开发者自己保证唯一性
        if (!directTargetInstanceObj) {
          _global2.default.registerComponents(propsRef || getPath(currentRoute) + ':' + componentIs, this);
        }
        if (mapStateToProps) {
          // store 触发的更新
          this.herculexUpdateLisitener = store.$emitter.addListener('updateState', function (_ref) {
            var _ref$state = _ref.state,
                state = _ref$state === undefined ? {} : _ref$state;

            var nextData = _dataTransform.setDataByStateProps.call(that, mapStateToProps, state, config, mapGettersToProps, store.getInstance(), true);
            // const originBindViewId = this.$page.$viewId || -1;
            // const currentViewId = getCurrentPages().slice().pop() ? getCurrentPages().slice().pop().$viewId || -1 : -1;
            // if (originBindViewId !== currentViewId) return;
            that.setData(nextData);
          });
        }
        if (typeof _didMount === 'function') {
          _didMount.call(this);
        }
      },
      didUnmount: function didUnmount() {
        this.herculexUpdateLisitener && this.herculexUpdateLisitener();
        if (typeof _didUnMount === 'function') {
          _didUnMount.call(this);
        }
      }
    });
  };
}