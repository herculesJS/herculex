'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var reserveWord = ['getIn', 'setIn', 'deleteIn', '$update', '$produce', 'compose'];

function omit(data) {
  return Object.keys(data).filter(function (d) {
    return reserveWord.indexOf(d) < 0;
  }).reduce(function (p, v) {
    p[v] = data[v];
    return p;
  }, {});
}
// 打印时去除这类无聊信息
function wrapState(state) {
  var filteredNewState = omit(state);
  if (filteredNewState.$getters) {
    filteredNewState.$getters = omit(filteredNewState.$getters);
  }
  if (filteredNewState.$global) {
    filteredNewState.$global = omit(filteredNewState.$global);
  }
  return filteredNewState;
}

exports.default = wrapState;