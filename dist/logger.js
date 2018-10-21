'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = logger;

var _is = require('./utils/is');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function logger() {
  var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function (store) {
    store.subscribe(function (mutation, state, prevState) {
      var payload = (0, _is.isString)(mutation.payload) ? mutation.payload : _extends({}, mutation.payload);
      console.info('%c ' + store.instanceName + 'Store:prev state', 'color: #9E9E9E; font-weight: bold', prevState);
      console.info('%c ' + store.instanceName + 'Store:mutation: ' + mutation.type, 'color: #03A9F4; font-weight: bold', payload, new Date().getTime());
      console.info('%c ' + store.instanceName + 'Store:next state', 'color: #4CAF50; font-weight: bold', state);
    }, function () {
      var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var next = arguments[1];

      var type = (0, _is.isSymbol)(action.type) ? action.type.toString() : action.type;
      var payload = (0, _is.isString)(action.payload) ? action.payload : _extends({}, action.payload);
      console.info('%c ' + store.instanceName + 'Store:action ' + type + ' dispatching', 'color: #9E9E9E; font-weight: bold', payload);
      next();
    });
  };
}