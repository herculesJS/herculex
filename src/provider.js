import global from './global';
import configPreHandler from './storeConfigPreHandle';

function getPath(link) {
  return link && link.split('/')[1];
}
// 允许空
export default function GlobalStore(config = {}) {
  configPreHandler(config);
  global.setGlobalStoreConfig(config);
  return function(config) {
    const _onLoad = config.onLoad;
    config.onLoad = function(options) {
      global.emitter.emitEvent('updateCurrentPath', {
        currentPath: getPath(options.path),
        query: {}
      });
      _onLoad(options);
    };
    return config;
  };
};
