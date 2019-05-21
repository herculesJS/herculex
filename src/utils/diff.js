// const TS = Object.prototype.toString;
// const OA = '[object Array]';
// const OO = '[object Object]';

// export default function flatDeepDiff(prev, next) {
//   if (TS.call(prev) !== OO || TS.call(next) !== OO) {
//     throw new TypeError('parameter must be object');
//   }

//   const flatDiff = {};
//   const initPath = '';
//   fillKeys(prev, next, initPath, flatDiff);
//   deepDiff(prev, next, initPath, flatDiff);

//   if (Object.keys(flatDiff).length === 0) {
//     return null;
//   }
//   return flatDiff;
// }

// function deepDiff(prev, next, path, flatDiff) {
//   if (prev === next) return;
//   const ntype = TS.call(next);
//   const ptype = TS.call(prev);
//   const isOO = ntype === OO && ptype === OO;
//   const isOA = ntype === OA && ptype === OA;

//   if (isOO) {
//     for (var key in next) {
//       if (!next.hasOwnProperty(key)) return;
//       const flatKey = path + (path.length ? '.' + key : key);
//       const nValue = next[key];
//       const pValue = prev[key];
//       const nVtype = TS.call(nValue);
//       const pVtype = TS.call(pValue);
//       if (nVtype !== OO && nVtype !== OA) {
//         if (nValue !== pValue) {
//           flatDiff[flatKey] = nValue;
//         }
//       } else if (nVtype === OA) {
//         if (pVtype !== OA || nValue.length < pValue.length) {
//           flatDiff[flatKey] = nValue;
//         } else {
//           deepDiff(pValue, nValue, flatKey, flatDiff);
//           // nValue.forEach((item, idx) => {
//           //   deepDiff(pValue[idx], item, flatKey + '[' + idx + ']', flatDiff);
//           // });
//         }
//       } else if (nVtype === OO) {
//         if (pVtype !== OO) {
//           flatDiff[flatKey] = nValue;
//         } else {
//           deepDiff(pValue, nValue, flatKey, flatDiff);
//           // for (var sk in nValue) {
//           //   deepDiff(pValue[sk], nValue[sk], flatKey + '.' + sk, flatDiff);
//           // }
//         }
//       }
//     }
//   } else if (isOA && next.length >= prev.length) {
//     /**
//     * nextData 的数组长度小于 prevData 的数组长度的时候，不做数组 deepDiff，这种情况尽量采用 $spliceData
//     * 删除数组中一项:
//       commit(type, payload, {
//         meta: {
//           splicePath: 'path', // eg. 'todos'
//           spliceData: [start, deleteCount, ...items] // eg. [100, 1]
//         }
//       });
//      */
//     next.forEach((item, idx) => {
//       deepDiff(prev[idx], item, path + '[' + idx + ']', flatDiff);
//     });
//   } else {
//     flatDiff[path] = next;
//   }

//   return flatDiff;
// }

// /**
//  * 把 prevData 中存在但 nextData 中不存在的 key 赋值 null, 包括数组中的对象
//  *
//  * { a: 1, b: 2 }, { a: 1 } => { a: 1, b: 2 }, { a: 1, b: null }
//  */
// function fillKeys(prev, next, path, flatDiff) {
//   if (prev === next) return;
//   const ntype = TS.call(next);
//   const ptype = TS.call(prev);
//   const isOO = ntype === OO && ptype === OO;

//   if (isOO) {
//     for (let key in prev) {
//       if (!prev.hasOwnProperty(key)) return;

//       var flatKey = path + (path.length ? '.' + key : key);
//       if (next[key] === undefined && prev[key] !== undefined) {
//         flatDiff[flatKey] = null;
//       } else {
//         fillKeys(prev[key], next[key], flatKey, flatDiff);
//       }
//     }
//   }
// }

const TS = Object.prototype.toString;
const OA = '[object Array]';
const OO = '[object Object]';

export default function flatDeepDiff(prev, next) {
  if (TS.call(prev) !== OO || TS.call(next) !== OO) {
    throw new TypeError('parameter must be object');
  }

  const flatDiff = {};
  const initPath = '';
  fillKeys(prev, next, initPath, flatDiff);
  deepDiff(prev, next, initPath, flatDiff);

  if (Object.keys(flatDiff).length === 0) {
    return null;
  }
  return flatDiff;
}

function deepDiff(prev, next, path, flatDiff) {
  if (prev === next) return;
  const ntype = TS.call(next);
  const ptype = TS.call(prev);
  const isOO = ntype === OO && ptype === OO;
  const isOA = ntype === OA && ptype === OA;

  if (isOO) {
    for (var key in next) {
      if (!next.hasOwnProperty(key)) return;
      const flatKey = path + (path.length ? '.' + key : key);
      const nValue = next[key];
      const pValue = prev[key];
      const nVtype = TS.call(nValue);
      const pVtype = TS.call(pValue);
      if (nVtype !== OO && nVtype !== OA) {
        if (nValue !== pValue) {
          flatDiff[flatKey] = nValue;
        }
      } else if (nVtype === OA) {
        if (pVtype !== OA || nValue.length < pValue.length) {
          flatDiff[flatKey] = nValue;
        } else {
          deepDiff(pValue, nValue, flatKey, flatDiff);
          // nValue.forEach((item, idx) => {
          //   deepDiff(pValue[idx], item, flatKey + '[' + idx + ']', flatDiff);
          // });
        }
      } else if (nVtype === OO) {
        if (pVtype !== OO) {
          flatDiff[flatKey] = nValue;
        } else {
          deepDiff(pValue, nValue, flatKey, flatDiff);
          // for (var sk in nValue) {
          //   deepDiff(pValue[sk], nValue[sk], flatKey + '.' + sk, flatDiff);
          // }
        }
      }
    }
  } else if (isOA && next.length >= prev.length) {
    /**
    * nextData 的数组长度小于 prevData 的数组长度的时候，不做数组 deepDiff，这种情况尽量采用 $spliceData
    * 删除数组中一项:
      commit(type, payload, {
        meta: {
          splicePath: 'path', // eg. 'todos'
          spliceData: [start, deleteCount, ...items] // eg. [100, 1]
        }
      });
     */
    next.forEach((item, idx) => {
      deepDiff(prev[idx], item, path + '[' + idx + ']', flatDiff);
    });
  } else {
    flatDiff[path] = next;
  }

  return flatDiff;
}

/**
 * 把 prevData 中存在但 nextData 中不存在的 key 赋值 null, 包括数组中的对象
 *
 * { a: 1, b: 2 }, { a: 1 } => { a: 1, b: 2 }, { a: 1, b: null }
 */
function fillKeys(prev, next, path, flatDiff) {
  if (prev === next) return;
  const ntype = TS.call(next);
  const ptype = TS.call(prev);
  const isOO = ntype === OO && ptype === OO;

  if (isOO) {
    for (let key in prev) {
      if (!prev.hasOwnProperty(key)) return;

      var flatKey = path + (path.length ? '.' + key : key);
      if (next[key] === undefined && prev[key] !== undefined) {
        // console.log(44444, flatDiff[flatKey]);
        // flatDiff[flatKey] = null;
      } else {
        fillKeys(prev[key], next[key], flatKey, flatDiff);
      }
    }
  }
};
