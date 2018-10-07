// wrapper.js
export default function wrapper(promise) {
  return promise
  .then(data => [undefined, data])
  .catch(error => [error, undefined]);
}
