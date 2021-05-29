function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { isString, isSymbol } from './utils/is';
export default function logger(option) {
  if (option === void 0) {
    option = {};
  }

  return function (store) {
    store.subscribe(function (mutation, state, prevState) {
      var payload = isString(mutation.payload) ? mutation.payload : _extends({}, mutation.payload);
      console.info("%c " + store.instanceName + "Store:prev state", 'color: #9E9E9E; font-weight: bold', prevState);
      console.info("%c " + store.instanceName + "Store:mutation: " + mutation.type, 'color: #03A9F4; font-weight: bold', payload, new Date().getTime());
      console.info("%c " + store.instanceName + "Store:next state", 'color: #4CAF50; font-weight: bold', state);
    }, function (action, next) {
      if (action === void 0) {
        action = {};
      }

      var type = isSymbol(action.type) ? action.type.toString() : action.type;
      var payload = isString(action.payload) ? action.payload : _extends({}, action.payload);
      console.info("%c " + store.instanceName + "Store:action " + type + " dispatching", 'color: #9E9E9E; font-weight: bold', payload);
      next();
    });
  };
}