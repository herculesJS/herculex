import { isArray } from './utils/is';
export function mapActionsToMethod(mappers, actions, target) {
  if (isArray(mappers)) {
    mappers.forEach(element => {
      // 强制不校验或校验但不通过
      if (actions === false || actions[element]) {
        target[element] = function(e) {
          const payload = e;
          this.dispatch(element, payload);
        };
      }
    });
  } else {
    Object.keys(mappers).forEach(element => {
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
      target[element] = function(e) {
        const payload = e;
        this.commit(element, payload);
      };
    });
  } else {
    Object.keys(mappers).forEach(element => {
      const methodName = mappers[element];
      target[element] = function(e) {
        const payload = e;
        this.commit(methodName, payload);
      };
    });
  }
}
