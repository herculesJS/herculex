// {%TITLE=判断%}

// -------------------- 常用数据类型判断 ------------------------------

// 输入任意类型, 判断是否是 array 类型
export var isArray = Array.isArray || function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

// 判断是否为 object 对象
/**
 * Solves equations of the form a * x = b
 * @example <caption>Example usage of method1.</caption>
 * {%isObject%}
 * @returns {Number} Returns the value of x for the equation.
 */
export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

export function isString(str) {
  return Object.prototype.toString.call(str) === '[object String]';
};

export function isPromise(e) {
  return !!e && typeof e.then === 'function';
};

export function isSymbol(d) {
  return Object.prototype.toString.call(d) === '[object Symbol]';
}

export function isFunc(fuc) {
  return Object.prototype.toString.call(fuc) === '[object Function]';
}
// TODO: is empty

export function isEmptyObject(obj) {
  if (!isObject(obj)) {
    return false;
  }
  return !Object.keys(obj).length;
}

export function canParseJson(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    return false;
  }
}

export function isTelNum(mobile) {
  return mobile && /^1\d{10}$/.test(mobile);
}

// ------------------- 常用设备的系统判断, android or ios ------------

export function isIOS() {
  return /iPhone|iTouch|iPad/i.test(navigator.userAgent);
}

export function isAndroid() {
  return /android/i.test(navigator.userAgent);
}
