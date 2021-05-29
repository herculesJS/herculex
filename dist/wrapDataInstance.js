import { getIn, setIn, deleteIn, compose, produce, update } from './utils/manipulate';
import { isArray, isString } from './utils/is';
export default function (instance, context) {
  if (instance === void 0) {
    instance = {};
  }

  // 当实例不是引用则不做wrap
  if (isString(instance) || typeof instance === 'number' || typeof instance === 'boolean') return instance;

  instance.getIn = function (path, initial) {
    var ctx = context ? context.data : this;
    var pathArray = isString(path) ? [path] : path;
    var result = getIn(ctx, pathArray, initial);

    for (var _len = arguments.length, funcs = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      funcs[_key - 2] = arguments[_key];
    }

    if (funcs.length) {
      return compose([result].concat(funcs));
    }

    return result;
  };

  instance.setIn = function (path, initial) {
    var ctx = context ? context.data : this;
    var pathArray = isString(path) ? [path] : path;
    return setIn(ctx, pathArray, initial);
  };

  instance.deleteIn = function (path) {
    var ctx = context ? context.data : this;
    var pathArray = isString(path) ? [path] : path;
    return deleteIn(ctx, pathArray);
  }; // use immutablity helper


  instance.$update = function (manipulate) {
    var ctx = context ? context.data : this;
    return update(ctx, manipulate);
  }; // use immer


  instance.$produce = function (manipulate) {
    var ctx = context ? context.data : this;
    return produce(ctx, manipulate);
  };

  instance.compose = function () {
    var ctx = context ? context.data : this;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var composeArray = isArray(args[0]) ? args[0] : args;
    composeArray.unshift(ctx);
    return compose(composeArray);
  };

  return instance;
}