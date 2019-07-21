'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = deepCopy;
/**
 * Deep Copy from rfdc(really fast deep copy)
 */
function deepCopy(o) {
  if (typeof o !== 'object' || o === null) return o;
  if (o instanceof Date) return new Date(o);
  if (Array.isArray(o)) return cloneArray(o, deepCopy);
  var o2 = {};
  for (var k in o) {
    var propDesc = Object.getOwnPropertyDescriptor(o, k);
    var cur = propDesc.value;
    if (propDesc.get || propDesc.set) {
      Object.defineProperty(o2, k, propDesc);
    } else if (typeof cur !== 'object' || cur === null) {
      o2[k] = cur;
    } else if (cur instanceof Date) {
      o2[k] = new Date(cur);
    } else {
      o2[k] = deepCopy(cur);
    }
  }
  return o2;
}

function cloneArray(a, fn) {
  var keys = Object.keys(a);
  var a2 = new Array(keys.length);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var cur = a[k];
    if (typeof cur !== 'object' || cur === null) {
      a2[k] = cur;
    } else if (cur instanceof Date) {
      a2[k] = new Date(cur);
    } else {
      a2[k] = fn(cur);
    }
  }
  return a2;
};