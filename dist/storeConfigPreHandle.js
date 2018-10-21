'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _is = require('./utils/is');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function shouldImmutableDecorate(f) {
  if (f._shouldImmutable || f._shouldImmutable === false) {
    return;
  }
  var functionString = f.toString();
  // 当 mutation 写了 return 语句，则自己保证其 immutable，建议就使用提供的 immutable-helper
  if (!/return /gm.test(functionString)) {
    f._shouldImmutable = true;
  }
}

function wrapMutation(config) {
  (0, _values2.default)(config).forEach(function (func) {
    if (!config.mutationImmutableWrapper) {
      shouldImmutableDecorate(func);
    }
  });
}

function configPreHandler(config) {
  // 防空
  config.state = config.state || {};
  config.mutations = config.mutations || {};
  config.actions = config.actions || {};
  // 给 mutaiton 包装是否需要 immer 操作
  if (config.mutations) {
    wrapMutation(config.mutations);
  }
  if (config.services) {
    var serviceRenameObj = Object.keys(config.services).reduce(function (p, v) {
      p['$service:' + v] = config.services[v];
      return p;
    }, {});
    (0, _assign2.default)(config.actions, serviceRenameObj);
  }
  // 给插件提供修改初始配置的能力
  if (config.plugins) {
    config.plugins = config.plugins.map(function (plugin) {
      if ((0, _is.isArray)(plugin)) {
        if ((0, _is.isFunc)(plugin[1])) {
          plugin[1](config);
        } else {
          (0, _assign2.default)(config, plugin[1]);
        }
        return plugin[0];
      }
      return plugin;
    });
  }
}

exports.default = configPreHandler;