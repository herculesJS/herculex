// wrapper.js
export default function wrapper(promise) {
  return promise.then(function (data) {
    return [undefined, data];
  })["catch"](function (error) {
    return [error, undefined];
  });
}