function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { isString, isArray, isFunc } from './utils/is';
import wrapDataInstance from './wrapDataInstance';
export function setDataByStateProps(mapStateToProps, data, config, mapGettersToProps, instance, next) {
  if (data === void 0) {
    data = {};
  }

  if (mapGettersToProps === void 0) {
    mapGettersToProps = [];
  }

  var gettersState = {}; // data 是增量

  var finalData = next ? instance.data : data;
  var stateToExpose = wrapDataInstance(_extends({}, finalData));
  var gettersToExpose = wrapDataInstance(_extends({}, finalData.$getters));
  var shouldUpdateKeys = Object.keys(data);

  var ownProps = _extends({}, this.props);

  if (mapGettersToProps) {
    gettersState = mapGettersToProps.filter(function (d) {
      return !!d;
    }).reduce(function (p, v) {
      p[v] = gettersToExpose ? gettersToExpose[v] : stateToExpose[v] || undefined;
      return p;
    }, {});
  } // 对齐 redux 的用法，第二个为 ownProps，不是很推荐，每次更新都会计算
  // TODO: 增加记忆点,暂时开发者自己保证


  if (isFunc(mapStateToProps)) {
    return mapStateToProps(stateToExpose, wrapDataInstance(ownProps), gettersToExpose);
  }

  if (isArray(mapStateToProps)) {
    // 必须新增部分包含这样的更新
    var _outterState = mapStateToProps.filter(function (d) {
      return !!d && shouldUpdateKeys.includes(d);
    }).reduce(function (p, v) {
      p[v] = finalData[v];
      return p;
    }, {});

    return _extends({}, _outterState, gettersState);
  }

  var outterState = Object.keys(mapStateToProps).reduce(function (p, v) {
    if (isString(mapStateToProps[v])) {
      if (!shouldUpdateKeys.includes(mapStateToProps[v])) {
        // 如果 diff 不包含第二次就不理睬
        return p;
      }

      p[v] = finalData[mapStateToProps[v]];
    } else {
      p[v] = mapStateToProps[v](stateToExpose, gettersToExpose, wrapDataInstance(ownProps), stateToExpose.$global, config);
    }

    return p;
  }, {});
  return _extends({}, outterState, gettersState);
}
export function setStoreDataByState(storeData, state) {
  if (storeData === void 0) {
    storeData = {};
  }

  if (state === void 0) {
    state = {};
  }

  return Object.keys(state).reduce(function (p, v) {
    p[v] = state[v];
    return p;
  }, storeData);
}