import { isArray, isFunc } from './utils/is';

function shouldImmutableDecorate(f, config) {
  if (f._shouldImmutable || f._shouldImmutable === false) {
    return;
  }
  const functionString = f.toString();
  // 当 mutation 写了 return 语句，则自己保证其 immutable，建议就使用提供的 immutable-helper
  if (config.$useImmer || !/return /gm.test(functionString)) {
    f._shouldImmutable = true;
  }
}

function wrapMutation(config) {
  Object.values(config).forEach(func => {
    shouldImmutableDecorate(func, config);
  });
}

function configPreHandler(config) {
  // 防空
  config.state = config.state || {};
  config.mutations = config.mutations || {};
  config.actions = config.actions || {};
    // 给插件提供修改初始配置的能力
  if (config.plugins) {
    config.plugins = config.plugins.map(plugin => {
      if (isArray(plugin)) {
        if (isFunc(plugin[1])) {
          plugin[1](config);
        } else {
          Object.assign(config, plugin[1]);
        }
        return plugin[0];
      }
      return plugin;
    });
  }
  // 给 mutaiton 包装是否需要 immer 操作
  if (config.mutations) {
    wrapMutation(config.mutations);
  }
  if (config.services) {
    const serviceRenameObj = Object.keys(config.services).reduce((p, v) => {
      p[`$service:${v}`] = config.services[v];
      return p;
    }, {});
    Object.assign(config.actions, serviceRenameObj);
  }
}

export default configPreHandler;
