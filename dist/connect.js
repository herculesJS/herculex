function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { createConnectHelpers } from './createHelpers';
import { setDataByStateProps } from './dataTransform';
import { mapActionsToMethod, mapMutationsToMethod } from './mapHelpersToMethod';
import { isString } from './utils/is';
import global from './global';

function getPath(link, number) {
  if (number === void 0) {
    number = 1;
  }

  return isString(link) && link.split('/')[number];
}

var defaultConfig = {
  data: {},
  props: {},
  methods: {}
};
export default function connect(options) {
  var _options$mapStateToPr = options.mapStateToProps,
      mapStateToProps = _options$mapStateToPr === void 0 ? [] : _options$mapStateToPr,
      _options$mapGettersTo = options.mapGettersToProps,
      mapGettersToProps = _options$mapGettersTo === void 0 ? [] : _options$mapGettersTo,
      _options$instanceName = options.instanceName,
      instanceName = _options$instanceName === void 0 ? '' : _options$instanceName,
      namespace = options.namespace,
      _options$data = options.data,
      data = _options$data === void 0 ? {} : _options$data,
      _options$props = options.props,
      props = _options$props === void 0 ? {} : _options$props;
  return function (config) {
    if (config === void 0) {
      config = defaultConfig;
    }

    config.data = config.data || {};
    config.props = config.props || {};
    config.methods = config.methods || {};

    if (options.mapActionsToMethod) {
      mapActionsToMethod(options.mapActionsToMethod, false, config.methods);
    }

    if (options.methods) {
      mapMutationsToMethod(options.methods, config.methods);
    }

    if (options.mapMutationsToMethod) {
      mapMutationsToMethod(options.mapMutationsToMethod, config.methods);
    }

    var _didMount = config.didMount;
    var _didUnMount = config.didUnmount;
    var key = namespace || instanceName;
    Object.assign(config.data, data);
    Object.assign(config.props, props);
    return _extends({}, config, {
      methods: _extends({}, config.methods, createConnectHelpers.call(global, global, key, config)),
      didMount: function didMount() {
        var _this = this;

        var that = this; // 组件可以添加 $ref 来拿相应的实例

        var propsRef = this.props.$ref;
        var key = namespace || instanceName || global.getCurrentPath() || global.getCurrentViewId() || -1;
        var targetInstanceObj = global.getInstance(key);

        if (!targetInstanceObj && typeof _didMount === 'function') {
          console.warn('未绑定 store');

          _didMount.call(this);

          return;
        } // 当前component表达


        var componentIs = getPath(this.is, 2);
        var currentRoute = targetInstanceObj.store.getInstance().route;
        console.info(componentIs + " \u7EC4\u4EF6\u5DF2\u5173\u8054 " + currentRoute + "_" + key + " \u7684 store", targetInstanceObj);
        Object.assign(this, {
          storeConfig: targetInstanceObj.config,
          storeInstance: targetInstanceObj.store
        });
        this.$emitter = global.emitter;
        var store = targetInstanceObj.store;
        this.$store = store;
        var initialData = setDataByStateProps.call(that, mapStateToProps, store.getInstance().data, config, mapGettersToProps, store.getInstance());
        this.setData(initialData); // 自动注册进 components 实例, propsRef 开发者自己保证唯一性

        global.registerComponents(propsRef || getPath(currentRoute) + ":" + componentIs, this);

        if (mapStateToProps) {
          // store 触发的更新
          this.herculexUpdateLisitener = store.$emitter.addListener('updateState', function (_ref) {
            var _ref$state = _ref.state,
                state = _ref$state === void 0 ? {} : _ref$state;
            var nextData = setDataByStateProps.call(that, mapStateToProps, state, config, mapGettersToProps, store.getInstance(), true);
            var originBindViewId = _this.$page.$viewId || -1;
            var currentViewId = getCurrentPages().pop() ? getCurrentPages().pop().$viewId || -1 : -1;
            if (originBindViewId !== currentViewId) return;
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