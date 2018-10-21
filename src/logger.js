import { isString, isSymbol } from './utils/is';

export default function logger (option = {}) {
  return function (store) {
    store.subscribe((mutation, state, prevState) => {
      const payload = isString(mutation.payload) ? mutation.payload : { ...mutation.payload };
      console.info(`%c ${store.instanceName}Store:prev state`, 'color: #9E9E9E; font-weight: bold', prevState);
      console.info(`%c ${store.instanceName}Store:mutation: ${mutation.type}`, 'color: #03A9F4; font-weight: bold', payload, new Date().getTime());
      console.info(`%c ${store.instanceName}Store:next state`, 'color: #4CAF50; font-weight: bold', state);
    }, (action = {}, next) => {
      let type = isSymbol(action.type) ? action.type.toString() : action.type;
      const payload = isString(action.payload) ? action.payload : { ...action.payload };
      console.info(`%c ${store.instanceName}Store:action ${type} dispatching`, 'color: #9E9E9E; font-weight: bold', payload);
      next();
    });
  };
}
