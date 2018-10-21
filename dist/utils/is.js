'use strict';

// {%TITLE=判断%}

// -------------------- 常用数据类型判断 ------------------------------

// 输入任意类型, 判断是否是 array 类型
var isArray = Array.isArray || function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

// 判断是否为 object 对象
/**
 * Solves equations of the form a * x = b
 * @example <caption>Example usage of method1.</caption>
 * {%isObject%}
 * @returns {Number} Returns the value of x for the equation.
 */
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

function isString(str) {
  return Object.prototype.toString.call(str) === '[object String]';
};

function isPromise(e) {
  return !!e && typeof e.then === 'function';
};

function isSymbol(d) {
  return Object.prototype.toString.call(d) === '[object Symbol]';
}

function isFunc(fuc) {
  return Object.prototype.toString.call(fuc) === '[object Function]';
}
// TODO: is empty

function isEmptyObject(obj) {
  if (!isObject(obj)) {
    return false;
  }
  return !Object.keys(obj).length;
}

function canParseJson(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    return false;
  }
}

function isTelNum(mobile) {
  return mobile && /^1\d{10}$/.test(mobile);
}

// ------------------- 常用设备的系统判断, android or ios ------------

function isIOS() {
  return (/iPhone|iTouch|iPad/i.test(navigator.userAgent)
  );
}

function isAndroid() {
  return (/android/i.test(navigator.userAgent)
  );
}

module.exports = {
  isArray: isArray,
  isObject: isObject,
  isString: isString,
  isEmptyObject: isEmptyObject,
  isSymbol: isSymbol,
  isFunc: isFunc,
  isPromise: isPromise,
  canParseJson: canParseJson,
  // -------
  isTelNum: isTelNum,
  // ------
  isIOS: isIOS,
  isAndroid: isAndroid
};