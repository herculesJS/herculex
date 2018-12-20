'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function EventEmitter() {}

var proto = EventEmitter.prototype;
var originalGlobalValue = exports.EventEmitter;

function indexOfListener(listeners, listener) {
  var i = listeners.length;
  while (i--) {
    if (listeners[i].listener === listener) {
      return i;
    }
  }

  return -1;
}

function alias(name) {
  return function aliasClosure() {
    return this[name].apply(this, arguments);
  };
}

proto.getListeners = function getListeners(evt) {
  var events = this._getEvents();
  var response;
  var key;

  if (evt instanceof RegExp) {
    response = {};
    for (key in events) {
      if (events.hasOwnProperty(key) && evt.test(key)) {
        response[key] = events[key];
      }
    }
  } else {
    response = events[evt] || (events[evt] = []);
  }

  return response;
};

/**
 * Takes a list of listener objects and flattens it into a list of listener functions.
 *
 * @param {Object[]} listeners Raw listener objects.
 * @return {Function[]} Just the listener functions.
 */
proto.flattenListeners = function flattenListeners(listeners) {
  var flatListeners = [];
  var i;

  for (i = 0; i < listeners.length; i += 1) {
    flatListeners.push(listeners[i].listener);
  }

  return flatListeners;
};

/**
 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
 *
 * @param {String|RegExp} evt Name of the event to return the listeners from.
 * @return {Object} All listener functions for an event in an object.
 */
proto.getListenersAsObject = function getListenersAsObject(evt) {
  var listeners = this.getListeners(evt);
  var response;

  if (listeners instanceof Array) {
    response = {};
    response[evt] = listeners;
  }

  return response || listeners;
};

function isValidListener(listener) {
  if (typeof listener === 'function' || listener instanceof RegExp) {
    return true;
  } else if (listener && typeof listener === 'object') {
    return isValidListener(listener.listener);
  } else {
    return false;
  }
}

proto.addListener = function addListener(evt, listener) {
  if (!isValidListener(listener)) {
    throw new TypeError('listener must be a function');
  }

  var listeners = this.getListenersAsObject(evt);
  var listenerIsWrapped = typeof listener === 'object';
  var key;
  var uid;
  for (key in listeners) {
    if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
      uid = 'lisitener_' + key + '_' + new Date().getTime();
      listeners[key].push(listenerIsWrapped ? listener : {
        listener: listener,
        once: false,
        uid: uid
      });
    }
  }
  return function () {
    var removeIndex = listeners[key].findIndex(function (o) {
      return o.uid === uid;
    });
    if (removeIndex !== -1) {
      listeners[key].splice(removeIndex, 1);
    }
    return proto;
  };
};

proto.on = alias('addListener');

proto.addOnceListener = function addOnceListener(evt, listener) {
  return this.addListener(evt, {
    listener: listener,
    once: true
  });
};

proto.once = alias('addOnceListener');

proto.defineEvent = function defineEvent(evt) {
  this.getListeners(evt);
  return this;
};

proto.defineEvents = function defineEvents(evts) {
  for (var i = 0; i < evts.length; i += 1) {
    this.defineEvent(evts[i]);
  }
  return this;
};

proto.removeListener = function removeListener(evt, listener) {
  var listeners = this.getListenersAsObject(evt);
  var index;
  var key;

  for (key in listeners) {
    if (listeners.hasOwnProperty(key)) {
      index = indexOfListener(listeners[key], listener);
      if (index !== -1) {
        listeners[key].splice(index, 1);
      }
    }
  }

  return this;
};

proto.off = alias('removeListener');

proto.addListeners = function addListeners(evt, listeners) {
  return this.manipulateListeners(false, evt, listeners);
};

proto.removeListeners = function removeListeners(evt, listeners) {
  return this.manipulateListeners(true, evt, listeners);
};

proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
  var i;
  var value;
  var single = remove ? this.removeListener : this.addListener;
  var multiple = remove ? this.removeListeners : this.addListeners;

  // If evt is an object then pass each of its properties to this method
  if (typeof evt === 'object' && !(evt instanceof RegExp)) {
    for (i in evt) {
      if (evt.hasOwnProperty(i) && (value = evt[i])) {
        if (typeof value === 'function') {
          single.call(this, i, value);
        } else {
          multiple.call(this, i, value);
        }
      }
    }
  } else {
    i = listeners.length;
    while (i--) {
      single.call(this, evt, listeners[i]);
    }
  }

  return this;
};

proto.removeEvent = function removeEvent(evt) {
  var type = typeof evt;
  var events = this._getEvents();
  var key;
  if (type === 'string') {
    delete events[evt];
  } else if (evt instanceof RegExp) {
    // Remove all events matching the regex.
    for (key in events) {
      if (events.hasOwnProperty(key) && evt.test(key)) {
        delete events[key];
      }
    }
  } else {
    delete this._events;
  }

  return this;
};

proto.removeAllListeners = alias('removeEvent');

proto.emitEvent = function emitEvent(evt, args) {
  var listenersMap = this.getListenersAsObject(evt);
  var listeners;
  var listener;
  var i;
  var key;
  var response;
  for (key in listenersMap) {
    if (listenersMap.hasOwnProperty(key)) {
      listeners = listenersMap[key].slice(0);

      for (i = 0; i < listeners.length; i++) {
        listener = listeners[i];
        if (listener.once === true) {
          this.removeListener(evt, listener.listener);
        }
        response = listener.listener.call(this, args || []);
        if (response === this._getOnceReturnValue()) {
          this.removeListener(evt, listener.listener);
        }
      }
    }
  }

  return this;
};

proto.emitEventChain = function emitEventWithNext(evt, args) {
  var _this = this;

  var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (d) {
    return d;
  };

  var listenersMap = this.getListenersAsObject(evt);
  var listeners;
  var key;
  for (key in listenersMap) {
    if (listenersMap.hasOwnProperty(key)) {
      (function () {
        listeners = listenersMap[key].slice(0);
        listeners.push({
          listener: function listener(action, next) {
            var last = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            // 最后一个回调获取最终上一次的结果
            cb(last);
          }
        });
        var that = _this;
        (function createNextFunc(i) {
          var listener = listeners[i];
          if (!listener) {
            return function (d) {
              return d;
            };
          }
          if (listener.once === true) {
            this.removeListener(evt, listener.listener);
          }
          return listener.listener.bind(that, args || [], createNextFunc(i + 1));
        })(0)();
      })();
    }
  }
  return this;
};

proto.trigger = alias('emitEvent');
proto.emit = function emit(evt) {
  var args = Array.prototype.slice.call(arguments, 1);
  return this.emitEvent(evt, args);
};

proto.setOnceReturnValue = function setOnceReturnValue(value) {
  this._onceReturnValue = value;
  return this;
};

proto._getOnceReturnValue = function _getOnceReturnValue() {
  if (this.hasOwnProperty('_onceReturnValue')) {
    return this._onceReturnValue;
  } else {
    return true;
  }
};

proto._getEvents = function _getEvents() {
  return this._events || (this._events = {});
};

EventEmitter.noConflict = function noConflict() {
  exports.EventEmitter = originalGlobalValue;
  return EventEmitter;
};

exports.default = EventEmitter;