import EventEmitter from './emitter';
import wrapDataInstance from './wrapDataInstance';
import _innerPlugins from './innerPlugins';
import { isString } from './utils/is';
import wrapState from './utils/wrapState';

class Global {
  constructor() {
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
    const that = this;
    this.emitter.addListener('updateCurrentPath', path => {
      Object.assign(that.router, path);
      const prevState = { ...that.globalStoreConfig.state };
      // console.info(`%c mutation: ROUTER`, 'color: #03A9F4; font-weight: bold', { ...that.router }, new Date().getTime());
      Object.assign(that.globalStoreConfig.state, {
        $router: that.router
      });
      const nextState = { ...that.globalStoreConfig.state };
      that.emitter.emitEvent('updateGlobalStore', { nextState, prevState, type: '$global:handleRouterChanged', payload: { ...path } });
    });
    this.emitter.addListener('updateState', data => {
      const { state, mutation } = data;
      const prevState = { ...that.globalStoreConfig.state };
      Object.assign(that.globalStoreConfig.state, state);
      const nextState = { ...that.globalStoreConfig.state };
      that.emitter.emitEvent('updateGlobalStore', { nextState, prevState, mutation });
    });
    this.messageManager = {
      clear: this.clearMessage.bind(this),
      push: this.pushMessage.bind(this),
      pop: this.popMessage.bind(this)
    };
  }
  subscribe(subscriber, actionSubscriber) {
    const that = this;
    this.emitter.addListener('updateGlobalStore', ({ nextState, prevState, mutation = {} }) => {
      subscriber && subscriber(mutation, wrapState(nextState), wrapState(prevState));
    });
    // if (actionSubscriber) {
    //   emitter.addListener('dispatchAction', (action) => {
    //     actionSubscriber(action);
    //   });
    // }
  }
  getGlobalState(mapGlobalToState) {
    const state = wrapDataInstance(this.globalStoreConfig.state);
    if (mapGlobalToState) {
      return mapGlobalToState(state);
    }
    return state;
  }
  clearMessage(channel) {
    if (this.messageChannel[channel]) {
      this.messageChannel[channel] = [];
    }
  }
  pushMessage(channel, payload) {
    if (this.messageChannel[channel]) {
      this.messageChannel[channel].push(payload);
    } else {
      this.messageChannel[channel] = [payload];
    }
  }
  popMessage(channel) {
    if (this.messageChannel[channel]) {
      return this.messageChannel[channel].pop();
    } else {
      return null;
    }
  }
  getCurrentPath() {
    return this.router.currentPath;
  }
  getCurrentViewId() {
    return this.router.viewId;
  }
  setGlobalStoreConfig(data) {
    this.globalStoreConfig = data;
    this.instanceName = 'global';
    if (this.globalStoreConfig.plugins) {
      this.globalStoreConfig.plugins.forEach(plugin => {
        const pluginFunc = isString(plugin) ? _innerPlugins[plugin] : plugin;
        pluginFunc(this);
      });
    }
  }
  registerComponents(name, instance) {
    this.components[name] = instance;
  }
  getComponentRef(name) {
    if (!this.components[name]) {
      console.warn(`未找到${name}组件，请检查组件名是否正确，是否在onReady后使用`);
      return null;
    }
    return this.components[name];
  }
  registerInstance(name, instance) {
    this.storeInstances[name] = instance;
  }
  getInstance(name) {
    return this.storeInstances[name];
  }
  getInstanceByViewId(id) {
    // 通过 viewid 找
    const target = Object.values(this.storeInstances).find(i => i.viewId === id);
    return target;
  }
  getState(name) {
    const target = this.storeInstances[name];
    if (target) {
      const { store } = target;
      const instance = store.getInstance();
      return instance.data;
    }
    return null;
  }
}
export default new Global();
