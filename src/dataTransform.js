import { isString, isArray, isFunc } from './utils/is';
import wrapDataInstance from './wrapDataInstance';

export function setDataByStateProps(mapStateToProps, data = {}, config, mapGettersToProps = [], instance, next) {
  let gettersState = {};
  // data 是增量
  const finalData = next ? instance.data : data;
  const stateToExpose = wrapDataInstance({ ...finalData });
  const gettersToExpose = wrapDataInstance({ ...finalData.$getters });
  const shouldUpdateKeys = Object.keys(data);
  const ownProps = {...this.props};

  if (mapGettersToProps) {
    gettersState = mapGettersToProps.filter(d => !!d).reduce((p, v) => {
      p[v] = gettersToExpose ? gettersToExpose[v] : (stateToExpose[v] || undefined);
      return p;
    }, {});
  }
  // 对齐 redux 的用法，第二个为 ownProps，不是很推荐，每次更新都会计算
  // TODO: 增加记忆点,暂时开发者自己保证
  if (isFunc(mapStateToProps)) {
    return mapStateToProps(stateToExpose, wrapDataInstance(ownProps), gettersToExpose);
  }
  if (isArray(mapStateToProps)) {
    // 必须新增部分包含这样的更新
    const outterState = mapStateToProps
        .filter(d => !!d && shouldUpdateKeys.includes(d))
        .reduce((p, v) => {
          p[v] = finalData[v];
          return p;
        }, {});
    return { ...outterState, ...gettersState };
  }
  const outterState = Object.keys(mapStateToProps).reduce((p, v) => {
    if (isString(mapStateToProps[v])) {
      if (!shouldUpdateKeys.includes(mapStateToProps[v])) {
        // 如果 diff 不包含第二次就不理睬
        return p;
      }
      p[v] = finalData[mapStateToProps[v]];
    } else {
      p[v] = mapStateToProps[v](stateToExpose, gettersToExpose, wrapDataInstance(ownProps), config);
    }
    return p;
  }, {});
  return { ...outterState, ...gettersState };
}

export function setStoreDataByState(storeData = {}, state = {}) {
  return Object.keys(state).reduce((p, v) => {
    p[v] = state[v];
    return p;
  }, storeData);
}
