'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.setDataByStateProps = setDataByStateProps;
exports.setStoreDataByState = setStoreDataByState;

var _is = require('./utils/is');

var _wrapDataInstance = require('./wrapDataInstance');

var _wrapDataInstance2 = _interopRequireDefault(_wrapDataInstance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setDataByStateProps(mapStateToProps) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var config = arguments[2];
  var mapGettersToProps = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var instance = arguments[4];
  var next = arguments[5];

  var gettersState = {};
  // data 是增量
  var finalData = next ? instance.data : data;
  var stateToExpose = (0, _wrapDataInstance2.default)(_extends({}, finalData));
  var gettersToExpose = (0, _wrapDataInstance2.default)(_extends({}, finalData.$getters));
  var shouldUpdateKeys = Object.keys(data);
  var ownProps = _extends({}, this.props);

  if (mapGettersToProps) {
    gettersState = mapGettersToProps.filter(function (d) {
      return !!d;
    }).reduce(function (p, v) {
      p[v] = gettersToExpose ? gettersToExpose[v] : stateToExpose[v] || undefined;
      return p;
    }, {});
  }
  // 对齐 redux 的用法，第二个为 ownProps，不是很推荐，每次更新都会计算
  // TODO: 增加记忆点,暂时开发者自己保证
  if ((0, _is.isFunc)(mapStateToProps)) {
    return mapStateToProps(stateToExpose, (0, _wrapDataInstance2.default)(ownProps), gettersToExpose);
  }
  if ((0, _is.isArray)(mapStateToProps)) {
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
    if ((0, _is.isString)(mapStateToProps[v])) {
      if (!shouldUpdateKeys.includes(mapStateToProps[v])) {
        // 如果 diff 不包含第二次就不理睬
        return p;
      }
      p[v] = finalData[mapStateToProps[v]];
    } else {
      p[v] = mapStateToProps[v](stateToExpose, gettersToExpose, (0, _wrapDataInstance2.default)(ownProps), stateToExpose.$global, config);
    }
    return p;
  }, {});
  return _extends({}, outterState, gettersState);
}

function setStoreDataByState() {
  var storeData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return Object.keys(state).reduce(function (p, v) {
    p[v] = state[v];
    return p;
  }, storeData);
}