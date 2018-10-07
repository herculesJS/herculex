'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildQueryString = buildQueryString;

var _is = require('./is');

function buildQueryString(obj) {
  if (!obj || !(0, _is.isObject)(obj)) {
    return '';
  }
  return Object.keys(obj).reduce(function (p, v, i) {
    return '' + p + (i ? '&' : '') + v + '=' + obj[v];
  }, '?');
};