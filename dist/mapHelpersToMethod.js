'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.mapActionsToMethod = mapActionsToMethod;
exports.mapMutationsToMethod = mapMutationsToMethod;

var _is = require('./utils/is');

var _wrapDataInstance = require('./wrapDataInstance');

var _wrapDataInstance2 = _interopRequireDefault(_wrapDataInstance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mapActionsToMethod(mappers, actions, target) {
  if ((0, _is.isArray)(mappers)) {
    mappers.forEach(function (element) {
      // 强制不校验或校验但不通过
      if (actions === false || actions[element]) {
        target[element] = function (payload) {
          if ((0, _is.isObject)(payload)) {
            (0, _wrapDataInstance2.default)(payload);
          }
          this.dispatch(element, payload);
        };
      }
    });
  } else if ((0, _is.isFunc)(mappers)) {
    var result = mappers(this.dispatch, this);
    (0, _assign2.default)(target, result);
  } else {
    Object.keys(mappers).forEach(function (element) {
      if ((0, _is.isFunc)(methodName)) {
        target[element] = function (payload) {
          if ((0, _is.isObject)(payload)) {
            (0, _wrapDataInstance2.default)(payload);
          }
          methodName.call(this, payload);
        };
        return;
      }
      var methodName = mappers[element];
      if (actions === false || actions[methodName]) {
        target[element] = function (e) {
          var payload = e;
          this.dispatch(methodName, payload);
        };
      }
    });
  }
};

function mapMutationsToMethod(mappers, target) {
  if ((0, _is.isArray)(mappers)) {
    mappers.forEach(function (element) {
      target[element] = function (payload) {
        if ((0, _is.isObject)(payload)) {
          (0, _wrapDataInstance2.default)(payload);
        }
        this.commit(element, payload);
      };
    });
  } else if ((0, _is.isFunc)(mappers)) {
    var result = mappers(this.commit, this);
    (0, _assign2.default)(target, result);
  } else {
    Object.keys(mappers).forEach(function (element) {
      var methodName = mappers[element];
      if ((0, _is.isFunc)(methodName)) {
        target[element] = function (payload) {
          if ((0, _is.isObject)(payload)) {
            (0, _wrapDataInstance2.default)(payload);
          }
          methodName.call(this, payload);
        };
        return;
      }
      target[element] = function (e) {
        var payload = e;
        this.commit(methodName, payload);
      };
    });
  }
}