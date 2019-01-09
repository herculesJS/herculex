'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = mapGettersToState;

var _is = require('./utils/is');

var _wrapDataInstance = require('./wrapDataInstance');

var _wrapDataInstance2 = _interopRequireDefault(_wrapDataInstance);

var _global = require('./global');

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function filterObjectByKey(array, object) {
  return array.reduce(function (p, v) {
    if (object && object[v] !== undefined) {
      p[v] = object[v];
    }
    return p;
  }, {});
};

function mapGettersToState(state) {
  var getters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var store = arguments[2];

  var result = _extends({}, state);
  result.$getters = Object.keys(getters).reduce(function (p, v) {
    var funcExec = getters[v];
    p[v] = {};
    Object.defineProperty(p, v, {
      get: function get() {
        var globalData = store.connectGlobal ? _global2.default.getGlobalState(store.mapGlobal) : {};
        var instance = store.getInstance() ? store.getInstance().state || {} : _extends({}, state, {
          $getters: getters,
          $global: globalData
        }) || {};
        if ((0, _is.isFunc)(funcExec)) {
          var params = filterObjectByKey(Object.keys(state), instance);
          var res = funcExec.call(this, (0, _wrapDataInstance2.default)(params), (0, _wrapDataInstance2.default)(instance.$getters), (0, _wrapDataInstance2.default)(globalData), _global2.default.getState);
          return res;
        }
        return funcExec;
      }
    });
    return p;
  }, {});
  return result;
}