'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (instance, context) {
  instance.getIn = function (path, initial) {
    var ctx = context ? context.data : this;
    var pathArray = (0, _is.isString)(path) ? [path] : path;
    return (0, _manipulate.getIn)(ctx, pathArray, initial);
  };
  instance.setIn = function (path, initial) {
    var ctx = context ? context.data : this;
    var pathArray = (0, _is.isString)(path) ? [path] : path;
    return (0, _manipulate.setIn)(ctx, pathArray, initial);
  };
  instance.deleteIn = function (path) {
    var ctx = context ? context.data : this;
    var pathArray = (0, _is.isString)(path) ? [path] : path;
    return (0, _manipulate.deleteIn)(ctx, pathArray);
  };
  // use immutablity helper
  instance.$update = function (manipulate) {
    var ctx = context ? context.data : this;
    return (0, _immutabilityHelper2.default)(ctx, manipulate);
  };
  // use immer
  instance.$produce = function (manipulate) {
    var ctx = context ? context.data : this;
    return (0, _manipulate.produce)(ctx, manipulate);
  };

  instance.compose = function () {
    var ctx = context ? context.data : this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var composeArray = (0, _is.isArray)(args[0]) ? args[0] : args;
    composeArray.unshift(ctx);
    return (0, _manipulate.compose)(composeArray);
  };
  return instance;
};

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _manipulate = require('./utils/manipulate');

var _is = require('./utils/is');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }