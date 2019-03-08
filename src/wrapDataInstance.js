import { getIn, setIn, deleteIn, compose, produce, update } from './utils/manipulate';
import { isArray, isString } from './utils/is';
export default function(instance = {}, context) {
  // 当实例不是引用则不做wrap
  if (isString(instance) || typeof instance === 'number' || typeof instance === 'boolean') return instance;
  instance.getIn = function(path, initial, ...funcs) {
    const ctx = context ? context.data : this;
    const pathArray = isString(path) ? [path] : path;
    const result = getIn(ctx, pathArray, initial);
    if (funcs.length) {
      return compose([result].concat(funcs));
    }
    return result;
  };
  instance.setIn = function(path, initial) {
    const ctx = context ? context.data : this;
    const pathArray = isString(path) ? [path] : path;
    return setIn(ctx, pathArray, initial);
  };
  instance.deleteIn = function(path) {
    const ctx = context ? context.data : this;
    const pathArray = isString(path) ? [path] : path;
    return deleteIn(ctx, pathArray);
  };
  // use immutablity helper
  instance.$update = function(manipulate) {
    const ctx = context ? context.data : this;
    return update(ctx, manipulate);
  };
  // use immer
  instance.$produce = function(manipulate) {
    const ctx = context ? context.data : this;
    return produce(ctx, manipulate);
  };

  instance.compose = function(...args) {
    const ctx = context ? context.data : this;
    let composeArray = isArray(args[0]) ? args[0] : args;
    composeArray.unshift(ctx);
    return compose(composeArray);
  };
  return instance;
}
