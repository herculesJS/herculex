"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = wrapper;
// wrapper.js
function wrapper(promise) {
  return promise.then(function (data) {
    return [undefined, data];
  }).catch(function (error) {
    return [error, undefined];
  });
}