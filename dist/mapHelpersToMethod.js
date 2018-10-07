'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapActionsToMethod = mapActionsToMethod;
exports.mapMutationsToMethod = mapMutationsToMethod;

var _is = require('./utils/is');

function mapActionsToMethod(mappers, actions, target) {
  if ((0, _is.isArray)(mappers)) {
    mappers.forEach(function (element) {
      // 强制不校验或校验但不通过
      if (actions === false || actions[element]) {
        target[element] = function (e) {
          var payload = e;
          this.dispatch(element, payload);
        };
      }
    });
  } else {
    Object.keys(mappers).forEach(function (element) {
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
      target[element] = function (e) {
        var payload = e;
        this.commit(element, payload);
      };
    });
  } else {
    Object.keys(mappers).forEach(function (element) {
      var methodName = mappers[element];
      target[element] = function (e) {
        var payload = e;
        this.commit(methodName, payload);
      };
    });
  }
}