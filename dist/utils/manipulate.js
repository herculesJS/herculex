'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.produce = exports.update = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.getIn = getIn;
exports.setIn = setIn;
exports.deleteIn = deleteIn;
exports.compose = compose;

var _is = require('./is');

var _immutabilityHelperEnhanced = require('immutability-helper-enhanced');

var _immutabilityHelperEnhanced2 = _interopRequireDefault(_immutabilityHelperEnhanced);

var _immer = require('immer');

var _immer2 = _interopRequireDefault(_immer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @desc 从一个对象通过操作序列来拿里面的值，做了基本防空措施
 * @param {object} state - 需要获取的数据源
 * @param {array} array - 操作路径
 * @param {any} initial - 默认值，当没有内容的时候
 * @example <caption>Example usage of getIn.</caption>
 * // testcase
 * {%common%}
 * // getIn
 * {%getIn%}
 * @returns {any} expected - 获取的值
 */
function getIn(state, array) {
  var initial = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var obj = (0, _assign2.default)({}, state);

  for (var i = 0; i < array.length; i++) {
    // when is undefined return init immediately
    if (typeof obj !== 'object' || obj === null) {
      return initial;
    }

    var prop = array[i];

    obj = obj[prop];
  }
  if (obj === undefined || obj === null) {
    return initial;
  }

  return obj;
}

/**
 * @desc 一个对象通过操作序列来设置里面的值，做到自动添加值
 * @param {object} state - 需要获取的数据源
 * @param {array} array - 操作路径
 * @param {any} initial - 默认值，当没有内容的时候
 * @example <caption>Example usage of setIn.</caption>
 * // testcase
 * {%common%}
 * // setIn
 * {%setIn%}
 * @returns {any} expected - 返回操作完成后新的值
 */
// {%TITLE=操作%}
function setIn(state, array, value) {
  if (!array) return state;
  var setRecursively = function setRecursively(state, array, value, index) {
    var clone = {};
    var prop = array[index];
    var newState = void 0;

    if (array.length > index) {
      // get cloned object
      if ((0, _is.isArray)(state)) {
        clone = state.slice(0);
      } else {
        clone = (0, _assign2.default)({}, state);
      }
      // not exists, make new {}
      newState = ((0, _is.isObject)(state) || (0, _is.isArray)(state)) && state[prop] !== undefined ? state[prop] : {};
      clone[prop] = setRecursively(newState, array, value, index + 1);
      return clone;
    }

    return value;
  };

  return setRecursively(state, array, value, 0);
}

/**
 * @desc 一个对象通过操作序列来删除里面的值, 做到防空, 返回新值
 * @param {object} state - 需要获取的数据源
 * @param {array} array - 操作路径
 * @example <caption>Example usage of deleteIn.</caption>
 * // testcase
 * {%common%}
 * // deleteIn
 * {%deleteIn%}
 * @returns {any} expected - 返回删除后新的对象 or 值
 */
function deleteIn(state, array) {
  var deleteRecursively = function deleteRecursively(state, array, index) {
    var clone = {};
    var prop = array[index];

    // not exists, just return, delete nothing
    if (!(0, _is.isObject)(state) || state[prop] === undefined) {
      return state;
    }

    // not last one, just clone
    if (array.length - 1 !== index) {
      if (Array.isArray(state)) {
        clone = state.slice();
      } else {
        clone = (0, _assign2.default)({}, state);
      }

      clone[prop] = deleteRecursively(state[prop], array, index + 1);

      return clone;
    }

    // delete here
    if (Array.isArray(state)) {
      clone = [].concat(state.slice(0, prop), state.slice(prop + 1));
    } else {
      clone = (0, _assign2.default)({}, state);
      delete clone[prop];
    }

    return clone;
  };

  return deleteRecursively(state, array, 0);
}

/**
 * @desc 将一组操作通过 array 的形式 reduce 组合
 * @param {array} array - 组合方式
 * @example <caption>Example usage of compose.</caption>
 * {%compose%}
 */
function compose(array) {
  return array.reduce(function (p, v) {
    if ((0, _is.isFunc)(v)) {
      return v(p);
    }
    if ((0, _is.isArray)(v) && (0, _is.isFunc)(v[0])) {
      return v[0].apply(v, [p].concat(v.slice(1)));
    }
    return p;
  });
}
exports.update = _immutabilityHelperEnhanced2.default;
exports.produce = _immer2.default;