'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = GlobalStore;

var _global = require('./global');

var _global2 = _interopRequireDefault(_global);

var _storeConfigPreHandle = require('./storeConfigPreHandle');

var _storeConfigPreHandle2 = _interopRequireDefault(_storeConfigPreHandle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPath(link) {
  return link && link.split('/')[1];
}
// 允许空
function GlobalStore() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  (0, _storeConfigPreHandle2.default)(config);
  _global2.default.setGlobalStoreConfig(config);
  return function (config) {
    var _onLoad = config.onLoad;
    config.onLoad = function (options) {
      _global2.default.emitter.emitEvent('updateCurrentPath', {
        currentPath: getPath(options.path),
        query: {}
      });
      _onLoad(options);
    };
    return config;
  };
};