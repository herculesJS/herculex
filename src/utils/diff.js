// 小程序专属性能优化
const TS = Object.prototype.toString;
const OA = '[object Array]';
const OO = '[object Object]';
const OF = '[object Function]';

export function flatDeepDiff(prev, next) {
  if (TS.call(next) !== OO || TS.call(prev) !== OO) {
    throw new TypeError('parameter must be object');
  }
  const flatDiff = {};
  deepDiff(prev, next, 0, '');
  if (!Object.keys(flatDiff).length) {
    return null;
  }
  return flatDiff;

  function deepDiff(prev, next, deep, path) {
    const isAllObject = TS.call(prev) === TS.call(next) && TS.call(prev) === OO;
    const isAllArray = TS.call(prev) === TS.call(next) && TS.call(prev) === OA;
    const isAllFunc = TS.call(prev) === TS.call(next) && TS.call(prev) === OF;
    if (isAllFunc) return;
    if (!(isAllObject || isAllArray)) {
      prev !== next && (flatDiff[path] = next);
    } else if (isAllObject) {
      for (let key in next) {
        if (key === '$getters') {
          // getters 外部处理
          // const nextData = clone(next[key]);
          // nextData._xxx = new Date().getTime();
          // flatDiff[deep ? `${path}.${key}` : `${key}`] = nextData;
          continue;
        }
        deepDiff(prev[key], next[key], deep + 1, deep ? `${path}.${key}` : `${key}`);
      }
    // 剪枝，深度 > 3 且 当前还是数组，那么不再继续 deep
    } else if (prev.length !== next.length || deep > 5) {
      flatDiff[path] = next;
    } else {
      const len = next.length;
      for (let i = 0; i < len; i++) {
        deepDiff(prev[i], next[i], deep + 1, deep ? `${path}.[${i}]` : `[${i}]`);
      }
    }
  }
}

export default flatDeepDiff;
