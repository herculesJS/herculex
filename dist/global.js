'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _emitter = require('./emitter');

var _emitter2 = _interopRequireDefault(_emitter);

var _wrapDataInstance = require('./wrapDataInstance');

var _wrapDataInstance2 = _interopRequireDefault(_wrapDataInstance);

var _innerPlugins2 = require('./innerPlugins');

var _innerPlugins3 = _interopRequireDefault(_innerPlugins2);

var _is = require('./utils/is');

var _wrapState = require('./utils/wrapState');

var _wrapState2 = _interopRequireDefault(_wrapState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Global = function () {
  function Global() {
    _classCallCheck(this, Global);

    this.emitter = new _emitter2.default();
    this.storeInstances = {};
    this.components = {};
    this.globalStoreConfig = {
      state: {}
    };
    this.messageChannel = {};
    this.router = {
      currentPath: '',
      query: null,
      context: {},
      from: '',
      viewId: '',
      fromViewId: ''
    };
    var that = this;
    this.emitter.addListener('updateCurrentPath', function (path) {
      (0, _assign2.default)(that.router, path);
      var prevState = _extends({}, that.globalStoreConfig.state);
      // console.info(`%c mutation: ROUTER`, 'color: #03A9F4; font-weight: bold', { ...that.router }, new Date().getTime());
      (0, _assign2.default)(that.globalStoreConfig.state, {
        $router: that.router
      });
      var nextState = _extends({}, that.globalStoreConfig.state);
      that.emitter.emitEvent('updateGlobalStore', { nextState: nextState, prevState: prevState, type: '$global:handleRouterChanged', payload: _extends({}, path) });
    });
    this.emitter.addListener('updateState', function (data) {
      var state = data.state,
          mutation = data.mutation;

      var prevState = _extends({}, that.globalStoreConfig.state);
      (0, _assign2.default)(that.globalStoreConfig.state, state);
      var nextState = _extends({}, that.globalStoreConfig.state);
      that.emitter.emitEvent('updateGlobalStore', { nextState: nextState, prevState: prevState, mutation: mutation });
    });
    this.messageManager = {
      clear: this.clearMessage.bind(this),
      push: this.pushMessage.bind(this),
      pop: this.popMessage.bind(this)
    };
  }

  Global.prototype.subscribe = function subscribe(subscriber, actionSubscriber) {
    var that = this;
    this.emitter.addListener('updateGlobalStore', function (_ref) {
      var nextState = _ref.nextState,
          prevState = _ref.prevState,
          _ref$mutation = _ref.mutation,
          mutation = _ref$mutation === undefined ? {} : _ref$mutation;

      subscriber && subscriber(mutation, (0, _wrapState2.default)(nextState), (0, _wrapState2.default)(prevState));
    });
    // if (actionSubscriber) {
    //   emitter.addListener('dispatchAction', (action) => {
    //     actionSubscriber(action);
    //   });
    // }
  };

  Global.prototype.getGlobalState = function getGlobalState(mapGlobalToState) {
    var state = (0, _wrapDataInstance2.default)(this.globalStoreConfig.state);
    if (mapGlobalToState) {
      return mapGlobalToState(state);
    }
    return state;
  };

  Global.prototype.clearMessage = function clearMessage(channel) {
    if (this.messageChannel[channel]) {
      this.messageChannel[channel] = [];
    }
  };

  Global.prototype.pushMessage = function pushMessage(channel, payload) {
    if (this.messageChannel[channel]) {
      this.messageChannel[channel].push(payload);
    } else {
      this.messageChannel[channel] = [payload];
    }
  };

  Global.prototype.popMessage = function popMessage(channel) {
    if (this.messageChannel[channel]) {
      return this.messageChannel[channel].pop();
    } else {
      return null;
    }
  };

  Global.prototype.getCurrentPath = function getCurrentPath() {
    return this.router.currentPath;
  };

  Global.prototype.getCurrentViewId = function getCurrentViewId() {
    return this.router.viewId;
  };

  Global.prototype.setGlobalStoreConfig = function setGlobalStoreConfig(data) {
    var _this = this;

    this.globalStoreConfig = data;
    this.instanceName = 'global';
    if (this.globalStoreConfig.plugins) {
      this.globalStoreConfig.plugins.forEach(function (plugin) {
        var pluginFunc = (0, _is.isString)(plugin) ? _innerPlugins3.default[plugin] : plugin;
        pluginFunc(_this);
      });
    }
  };

  Global.prototype.registerComponents = function registerComponents(name, instance) {
    this.components[name] = instance;
  };

  Global.prototype.getComponentRef = function getComponentRef(name) {
    if (!this.components[name]) {
      console.warn('\u672A\u627E\u5230' + name + '\u7EC4\u4EF6\uFF0C\u8BF7\u68C0\u67E5\u7EC4\u4EF6\u540D\u662F\u5426\u6B63\u786E\uFF0C\u662F\u5426\u5728onReady\u540E\u4F7F\u7528');
      return null;
    }
    return this.components[name];
  };

  Global.prototype.registerInstance = function registerInstance(name, instance) {
    this.storeInstances[name] = instance;
  };

  Global.prototype.getInstance = function getInstance(name) {
    return this.storeInstances[name];
  };

  Global.prototype.getInstanceByViewId = function getInstanceByViewId(id) {
    // 通过 viewid 找
    var target = (0, _values2.default)(this.storeInstances).find(function (i) {
      return i.viewId === id;
    });
    return target;
  };

  Global.prototype.getState = function getState(name) {
    var target = this.storeInstances[name];
    if (target) {
      var store = target.store;

      var instance = store.getInstance();
      return instance.data;
    }
    return null;
  };

  return Global;
}();

exports.default = new Global();