const reserveWord = ['getIn', 'setIn', 'deleteIn', '$update', '$produce', 'compose'];

function omit(data) {
  return Object.keys(data).filter(d => reserveWord.indexOf(d) < 0).reduce((p, v) => {
    p[v] = data[v];
    return p;
  }, {});
}
// 打印时去除这类无聊信息
function wrapState(state) {
  const filteredNewState = omit(state);
  if (filteredNewState.$getters) {
    filteredNewState.$getters = omit(filteredNewState.$getters);
  }
  if (filteredNewState.$global) {
    filteredNewState.$global = omit(filteredNewState.$global);
  }
  return filteredNewState;
}

export default wrapState;
