import { isObject } from './is';

export function buildQueryString(obj) {
  if (!obj || !isObject(obj)) {
    return '';
  }
  return Object.keys(obj).reduce((p, v, i) => {
    return `${p}${i ? '&' : ''}${v}=${obj[v]}`;
  }, '?');
};
