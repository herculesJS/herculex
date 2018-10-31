'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (register) {
  var config = {
    onLoad: function onLoad(data) {
      this.dispatch('pageOnLoad', data);
    },
    onReady: function onReady(data) {
      this.dispatch('pageOnReady', data);
    },
    onShow: function onShow(data) {
      this.dispatch('pageOnShow', data);
    },
    onHide: function onHide(data) {
      this.dispatch('pageOnHide', data);
    },
    onUnload: function onUnload(data) {
      this.dispatch('pageOnUnload', data);
    }
  };
  (0, _mapHelpersToMethod.mapMutationsToMethod)(this.methods, config);
  return register(config);
};

var _mapHelpersToMethod = require('../mapHelpersToMethod');