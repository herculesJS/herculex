import { createConnectHelpers } from './createHelpers';
import { setDataByStateProps } from './dataTransform';
import { mapActionsToMethod, mapMutationsToMethod } from './mapHelpersToMethod';
import { isString } from './utils/is';

import global from './global';

function getPath(link, number = 1) {
  return isString(link) && link.split('/')[number];
}

const defaultConfig = {
  data: {},
  props: {},
  methods: {}
};

function getTargetInstance() {

}
export default function connect(options, directTargetInstanceObj) {
  const { name, mapStateToProps = [], mapGettersToProps = [], instanceName = '', namespace, data = {}, props = {} } = options;
  return function (config = defaultConfig) {
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
    const _didMount = config.didMount;
    const _didUnMount = config.didUnmount;
    const key = namespace || instanceName;
    Object.assign(config.data, data);
    Object.assign(config.props, props);
    return {
      ...config,
      methods: {
        ...config.methods,
        ...createConnectHelpers.call(global, global, key, config, directTargetInstanceObj)
      },
      didMount() {
        const that = this;
        // 组件可以添加 $ref 来拿相应的实例
        const propsRef = this.props.$ref;
        const propsNamespace = this.props.$namespace;
        let targetInstanceObj;
        const key = propsNamespace || namespace || instanceName || global.getCurrentPath() || global.getCurrentViewId() || -1;
        if (this.$page) {
          const _store = this.$page.$store;
          targetInstanceObj = {
            config: _store.actions,
            currentPath: getPath(this.$page.route),
            name: getPath(this.$page.route),
            store: _store
          };
        } else if (directTargetInstanceObj) {
          targetInstanceObj = { ...directTargetInstanceObj };
        } else {
          targetInstanceObj = global.getInstance(key);
        }
        if (!targetInstanceObj && typeof _didMount === 'function') {
          console.warn('未绑定 store');
          _didMount.call(this);
          return;
        }
        // 当前component表达
        const componentIs = name || !directTargetInstanceObj && getPath(this.is, 2) || 'unknown';
        const currentStore = targetInstanceObj.store.getInstance();
        const currentRoute = currentStore.namespace || currentStore.instanceName || currentStore.route || '';
        // console.info(`${componentIs} 组件已关联 ${currentRoute}_${key} 的 store`, targetInstanceObj);
        Object.assign(this, {
          storeConfig: targetInstanceObj.config,
          storeInstance: targetInstanceObj.store
        });
        this.$emitter = global.emitter;
        const store = targetInstanceObj.store;
        this.$store = store;
        const initialData = setDataByStateProps.call(that, mapStateToProps, store.getInstance().data, config, mapGettersToProps, store.getInstance());
        this.setData(initialData);
        // 自动注册进 components 实例, propsRef 开发者自己保证唯一性
        if (!directTargetInstanceObj) {
          global.registerComponents(propsRef || `${getPath(currentRoute)}:${componentIs}`, this);
        }
        if (mapStateToProps) {
          // store 触发的更新
          this.herculexUpdateLisitener = store.$emitter.addListener('updateState', ({state = {}}) => {
            const nextData = setDataByStateProps.call(that, mapStateToProps, state, config, mapGettersToProps, store.getInstance(), true);
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
      didUnmount() {
        this.herculexUpdateLisitener && this.herculexUpdateLisitener();
        if (typeof _didUnMount === 'function') {
          _didUnMount.call(this);
        }
      }
    };
  };
}
