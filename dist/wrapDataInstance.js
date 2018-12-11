'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var instance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var context = arguments[1];

  instance.getIn = function (path, initial) {
    var ctx = context ? context.data : this;
    var pathArray = (0, _is.isString)(path) ? [path] : path;
    var result = (0, _manipulate.getIn)(ctx, pathArray, initial);

    for (var _len = arguments.length, funcs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      funcs[_key - 2] = arguments[_key];
    }

    if (funcs.length) {
      return (0, _manipulate.compose)([result].concat(funcs));
    }
    return result;
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
    return (0, _manipulate.update)(ctx, manipulate);
  };
  // use immer
  instance.$produce = function (manipulate) {
    var ctx = context ? context.data : this;
    return (0, _manipulate.produce)(ctx, manipulate);
  };

  instance.compose = function () {
    var ctx = context ? context.data : this;

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var composeArray = (0, _is.isArray)(args[0]) ? args[0] : args;
    composeArray.unshift(ctx);
    return (0, _manipulate.compose)(composeArray);
  };
  return instance;
};

var _manipulate = require('./utils/manipulate');

var _is = require('./utils/is');