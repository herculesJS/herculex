'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flatDeepDiff = flatDeepDiff;
// 小程序专属性能优化
var TS = Object.prototype.toString;
var OA = '[object Array]';
var OO = '[object Object]';
var OF = '[object Function]';

function flatDeepDiff(prev, next) {
  if (TS.call(next) !== OO || TS.call(prev) !== OO) {
    throw new TypeError('parameter must be object');
  }
  var flatDiff = {};
  deepDiff(prev, next, 0, '');
  if (!Object.keys(flatDiff).length) {
    return null;
  }
  return flatDiff;

  function deepDiff(prev, next, deep, path) {
    var isAllObject = TS.call(prev) === TS.call(next) && TS.call(prev) === OO;
    var isAllArray = TS.call(prev) === TS.call(next) && TS.call(prev) === OA;
    var isAllFunc = TS.call(prev) === TS.call(next) && TS.call(prev) === OF;
    if (isAllFunc) return;
    if (!(isAllObject || isAllArray)) {
      prev !== next && (flatDiff[path] = next);
    } else if (isAllObject) {
      for (var key in next) {
        if (key === '$getters') {
          // getters 外部处理
          // const nextData = clone(next[key]);
          // nextData._xxx = new Date().getTime();
          // flatDiff[deep ? `${path}.${key}` : `${key}`] = nextData;
          continue;
        }
        deepDiff(prev[key], next[key], deep + 1, deep ? path + '.' + key : '' + key);
      }
      // 剪枝，深度 > 3 且 当前还是数组，那么不再继续 deep
    } else if (prev.length !== next.length || deep > 5) {
      flatDiff[path] = next;
    } else {
      var len = next.length;
      for (var i = 0; i < len; i++) {
        deepDiff(prev[i], next[i], deep + 1, deep ? path + '.[' + i + ']' : '[' + i + ']');
      }
    }
  }
}

exports.default = flatDeepDiff;