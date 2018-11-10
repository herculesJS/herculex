// {%TITLE=操作%}
import { isFunc, isArray, isObject } from './is';
import update from 'immutability-helper';
import produce from 'immer';

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
export function getIn(state, array, initial = null) {
  let obj = Object.assign({}, state);

  for (let i = 0; i < array.length; i++) {
    // when is undefined return init immediately
    if (typeof obj !== 'object' || obj === null) {
      return initial;
    }

    const prop = array[i];

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
export function setIn(state, array, value) {
  if (!array) return state;
  const setRecursively = function(state, array, value, index) {
    let clone = {};
    let prop = array[index];
    let newState;

    if (array.length > index) {
      // get cloned object
      if (isArray(state)) {
        clone = state.slice(0);
      } else {
        clone = Object.assign({}, state);
      }
      // not exists, make new {}
      newState = ((isObject(state) || isArray(state)) && state[prop] !== undefined) ? state[prop] : {};
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
export function deleteIn(state, array) {
  const deleteRecursively = function (state, array, index) {
    let clone = {};
    let prop = array[index];

    // not exists, just return, delete nothing
    if (!isObject(state) || state[prop] === undefined) {
      return state;
    }

    // not last one, just clone
    if (array.length - 1 !== index) {
      if (Array.isArray(state)) {
        clone = state.slice();
      } else {
        clone = Object.assign({}, state);
      }

      clone[prop] = deleteRecursively(state[prop], array, index + 1);

      return clone;
    }

    // delete here
    if (Array.isArray(state)) {
      clone = [].concat(state.slice(0, prop), state.slice(prop + 1));
    } else {
      clone = Object.assign({}, state);
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
export function compose(array) {
  return array.reduce((p, v) => {
    if (isFunc(v)) {
      return v(p);
    }
    if (isArray(v) && isFunc(v[0])) {
      return v[0](p, ...v.slice(1));
    }
    return p;
  });
}
export { update, produce };
