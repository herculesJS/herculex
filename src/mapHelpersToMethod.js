import { isArray, isFunc, isObject } from './utils/is';
import wrapDataInstance from './wrapDataInstance';
export function mapActionsToMethod(mappers, actions, target) {
  if (isArray(mappers)) {
    mappers.forEach(element => {
      // 强制不校验或校验但不通过
      if (actions === false || actions[element]) {
        target[element] = function(payload) {
          if (isObject(payload)) {
            wrapDataInstance(payload);
          }
          this.dispatch(element, payload);
        };
      }
    });
  } else if (isFunc(mappers)) {
    const result = mappers(this.dispatch, this);
    Object.assign(target, result);
  } else {
    Object.keys(mappers).forEach(element => {
      if (isFunc(methodName)) {
        target[element] = function(payload) {
          if (isObject(payload)) {
            wrapDataInstance(payload);
          }
          methodName.call(this, payload);
        };
        return;
      }
      const methodName = mappers[element];
      if (actions === false || actions[methodName]) {
        target[element] = function(e) {
          const payload = e;
          this.dispatch(methodName, payload);
        };
      }
    });
  }
};

export function mapMutationsToMethod(mappers, target) {
  if (isArray(mappers)) {
    mappers.forEach(element => {
      target[element] = function(payload) {
        if (isObject(payload)) {
          wrapDataInstance(payload);
        }
        this.commit(element, payload);
      };
    });
  } else if (isFunc(mappers)) {
    const result = mappers(this.commit, this);
    Object.assign(target, result);
  } else {
    Object.keys(mappers).forEach(element => {
      const methodName = mappers[element];
      if (isFunc(methodName)) {
        target[element] = function(payload) {
          if (isObject(payload)) {
            wrapDataInstance(payload);
          }
          methodName.call(this, payload);
        };
        return;
      }
      target[element] = function(e) {
        const payload = e;
        this.commit(methodName, payload);
      };
    });
  }
}
