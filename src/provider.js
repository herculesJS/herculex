import myGlobal from './global';
import configPreHandler from './storeConfigPreHandle';

function getPath(link) {
  return link && link.split('/')[1];
}
// 允许空
export default function GlobalStore(config = {}) {
  configPreHandler(config);
  myGlobal.setGlobalStoreConfig(config);
  return function(config) {
    const _onLoad = config.onLoad;
    config.onLoad = function(options) {
      myGlobal.emitter.emitEvent('updateCurrentPath', {
        currentPath: getPath(options.path),
        query: {}
      });
      _onLoad(options);
    };
    return config;
  };
};
