function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { isFunc } from './utils/is';
import wrapInstance from './wrapDataInstance';
import global from './global';

function filterObjectByKey(array, object) {
  return array.reduce(function (p, v) {
    if (object && object[v] !== undefined) {
      p[v] = object[v];
    }

    return p;
  }, {});
}

;
export default function mapGettersToState(state, getters, store) {
  if (getters === void 0) {
    getters = {};
  }

  var result = _extends({}, state);

  result.$getters = Object.keys(getters).reduce(function (p, v) {
    var funcExec = getters[v];
    p[v] = {};
    Object.defineProperty(p, v, {
      get: function get() {
        var globalData = store.connectGlobal ? global.getGlobalState(store.mapGlobal) : {};
        var instance = store.getInstance() ? store.getInstance().state || {} : this || {};

        if (isFunc(funcExec)) {
          var params = filterObjectByKey(Object.keys(state), instance);
          return funcExec.call(this, wrapInstance(params), wrapInstance(instance.$getters), wrapInstance(globalData), global.getState);
        }

        return funcExec;
      }
    });
    return p;
  }, {});
  return result;
}