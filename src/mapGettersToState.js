import { isFunc } from './utils/is';
import wrapInstance from './wrapDataInstance';
import myGlobal from './global';

function filterObjectByKey(array, object) {
  return array.reduce((p, v) => {
    if (object && object[v] !== undefined) {
      p[v] = object[v];
    }
    return p;
  }, {});
};

export default function mapGettersToState(state, getters = {}, store) {
  const result = { ...state };
  result.$getters = Object.keys(getters).reduce((p, v) => {
    const funcExec = getters[v];
    p[v] = {};
    Object.defineProperty(p, v, {
      get: function() {
        const globalData = store.connectGlobal ? myGlobal.getGlobalState(store.mapGlobal) : {};
        const instance = store.getInstance() ? (store.getInstance().state || {}) : (this || {});
        if (isFunc(funcExec)) {
          const params = filterObjectByKey(Object.keys(state), instance);
          return funcExec.call(this, wrapInstance(params), wrapInstance(instance.$getters), wrapInstance(globalData), myGlobal.getState);
        }
        return funcExec;
      }
    });
    return p;
  }, {});
  return result;
}
