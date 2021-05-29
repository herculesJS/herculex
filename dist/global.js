function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import EventEmitter from './emitter';
import wrapDataInstance from './wrapDataInstance';
import _innerPlugins from './innerPlugins';
import { isString } from './utils/is';
import wrapState from './utils/wrapState';

var Global = /*#__PURE__*/function () {
  function Global() {
    this.emitter = new EventEmitter();
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
      Object.assign(that.router, path);

      var prevState = _extends({}, that.globalStoreConfig.state); // console.info(`%c mutation: ROUTER`, 'color: #03A9F4; font-weight: bold', { ...that.router }, new Date().getTime());


      Object.assign(that.globalStoreConfig.state, {
        $router: that.router
      });

      var nextState = _extends({}, that.globalStoreConfig.state);

      that.emitter.emitEvent('updateGlobalStore', {
        nextState: nextState,
        prevState: prevState,
        type: '$global:handleRouterChanged',
        payload: _extends({}, path)
      });
    });
    this.emitter.addListener('updateState', function (data) {
      var state = data.state,
          mutation = data.mutation;

      var prevState = _extends({}, that.globalStoreConfig.state);

      Object.assign(that.globalStoreConfig.state, state);

      var nextState = _extends({}, that.globalStoreConfig.state);

      that.emitter.emitEvent('updateGlobalStore', {
        nextState: nextState,
        prevState: prevState,
        mutation: mutation
      });
    });
    this.messageManager = {
      clear: this.clearMessage.bind(this),
      push: this.pushMessage.bind(this),
      pop: this.popMessage.bind(this)
    };
  }

  var _proto = Global.prototype;

  _proto.subscribe = function subscribe(subscriber, actionSubscriber) {
    var that = this;
    this.emitter.addListener('updateGlobalStore', function (_ref) {
      var nextState = _ref.nextState,
          prevState = _ref.prevState,
          _ref$mutation = _ref.mutation,
          mutation = _ref$mutation === void 0 ? {} : _ref$mutation;
      subscriber && subscriber(mutation, wrapState(nextState), wrapState(prevState));
    }); // if (actionSubscriber) {
    //   emitter.addListener('dispatchAction', (action) => {
    //     actionSubscriber(action);
    //   });
    // }
  };

  _proto.getGlobalState = function getGlobalState(mapGlobalToState) {
    var state = wrapDataInstance(this.globalStoreConfig.state);

    if (mapGlobalToState) {
      return mapGlobalToState(state);
    }

    return state;
  };

  _proto.clearMessage = function clearMessage(channel) {
    if (this.messageChannel[channel]) {
      this.messageChannel[channel] = [];
    }
  };

  _proto.pushMessage = function pushMessage(channel, payload) {
    if (this.messageChannel[channel]) {
      this.messageChannel[channel].push(payload);
    } else {
      this.messageChannel[channel] = [payload];
    }
  };

  _proto.popMessage = function popMessage(channel) {
    if (this.messageChannel[channel]) {
      return this.messageChannel[channel].pop();
    } else {
      return null;
    }
  };

  _proto.getCurrentPath = function getCurrentPath() {
    return this.router.currentPath;
  };

  _proto.getCurrentViewId = function getCurrentViewId() {
    return this.router.viewId;
  };

  _proto.setGlobalStoreConfig = function setGlobalStoreConfig(data) {
    var _this = this;

    this.globalStoreConfig = data;
    this.instanceName = 'global';

    if (this.globalStoreConfig.plugins) {
      this.globalStoreConfig.plugins.forEach(function (plugin) {
        var pluginFunc = isString(plugin) ? _innerPlugins[plugin] : plugin;
        pluginFunc(_this);
      });
    }
  };

  _proto.registerComponents = function registerComponents(name, instance) {
    this.components[name] = instance;
  };

  _proto.getComponentRef = function getComponentRef(name) {
    if (!this.components[name]) {
      console.warn("\u672A\u627E\u5230" + name + "\u7EC4\u4EF6\uFF0C\u8BF7\u68C0\u67E5\u7EC4\u4EF6\u540D\u662F\u5426\u6B63\u786E\uFF0C\u662F\u5426\u5728onReady\u540E\u4F7F\u7528");
      return null;
    }

    return this.components[name];
  };

  _proto.registerInstance = function registerInstance(name, instance) {
    this.storeInstances[name] = instance;
  };

  _proto.getInstance = function getInstance(name) {
    return this.storeInstances[name];
  };

  _proto.getInstanceByViewId = function getInstanceByViewId(id) {
    // 通过 viewid 找
    var target = Object.values(this.storeInstances).find(function (i) {
      return i.viewId === id;
    });
    return target;
  };

  _proto.getState = function getState(name) {
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

export default new Global();