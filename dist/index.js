function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}// {%TITLE=判断%}
// -------------------- 常用数据类型判断 ------------------------------
// 输入任意类型, 判断是否是 array 类型
var isArray = Array.isArray || function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}; // 判断是否为 object 对象

/**
 * Solves equations of the form a * x = b
 * @example <caption>Example usage of method1.</caption>
 * {%isObject%}
 * @returns {Number} Returns the value of x for the equation.
 */

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
function isString(str) {
  return Object.prototype.toString.call(str) === '[object String]';
}
function isSymbol(d) {
  return Object.prototype.toString.call(d) === '[object Symbol]';
}
function isFunc(fuc) {
  return Object.prototype.toString.call(fuc) === '[object Function]';
} // TODO: is empty
function EventEmitter() {}

var proto = EventEmitter.prototype;

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
  } else if (listener && _typeof(listener) === 'object') {
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
  var listenerIsWrapped = _typeof(listener) === 'object';
  var key;
  var uid;

  for (key in listeners) {
    if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
      uid = "lisitener_".concat(key, "_").concat(new Date().getTime());
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
  var multiple = remove ? this.removeListeners : this.addListeners; // If evt is an object then pass each of its properties to this method

  if (_typeof(evt) === 'object' && !(evt instanceof RegExp)) {
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
  var type = _typeof(evt);

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
};function logger() {
  return function (store) {
    store.subscribe(function (mutation, state, prevState) {
      var payload = isString(mutation.payload) ? mutation.payload : _objectSpread({}, mutation.payload);
      console.info("%c ".concat(store.instanceName, "Store:prev state"), 'color: #9E9E9E; font-weight: bold', prevState);
      console.info("%c ".concat(store.instanceName, "Store:mutation: ").concat(mutation.type), 'color: #03A9F4; font-weight: bold', payload, new Date().getTime());
      console.info("%c ".concat(store.instanceName, "Store:next state"), 'color: #4CAF50; font-weight: bold', state);
    }, function () {
      var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var next = arguments.length > 1 ? arguments[1] : undefined;
      var type = isSymbol(action.type) ? action.type.toString() : action.type;
      var payload = isString(action.payload) ? action.payload : _objectSpread({}, action.payload);
      console.info("%c ".concat(store.instanceName, "Store:action ").concat(type, " dispatching"), 'color: #9E9E9E; font-weight: bold', payload);
      next();
    });
  };
}var _innerPlugins = {
  logger: logger()
};// https://github.com/zertosh/invariant/blob/master/browser.js

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  // if (process.env.NODE_ENV !== 'production') {
  //   if (format === undefined) {
  //     throw new Error('invariant requires an error message argument');
  //   }
  // }
  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

var invariant_1 = invariant;var hasOwnProperty = Object.prototype.hasOwnProperty;
var splice = Array.prototype.splice;

var toString = Object.prototype.toString;
var type = function(obj) {
  return toString.call(obj).slice(8, -1);
};

var assign = Object.assign || /* istanbul ignore next */ function assign(target, source) {
  getAllKeys(source).forEach(function(key) {
    if (hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  });
  return target;
};

var getAllKeys = typeof Object.getOwnPropertySymbols === 'function' ?
  function(obj) { return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj)) } :
  /* istanbul ignore next */ function(obj) { return Object.keys(obj) };

/* istanbul ignore next */
function copy(object) {
  if (Array.isArray(object)) {
    return assign(object.constructor(object.length), object)
  } else if (type(object) === 'Map') {
    return new Map(object)
  } else if (type(object) === 'Set') {
    return new Set(object)
  } else if (object && typeof object === 'object') {
    var prototype = Object.getPrototypeOf(object);
    return assign(Object.create(prototype), object);
  } else {
    return object;
  }
}

function newContext() {
  var commands = assign({}, defaultCommands);
  update.extend = function(directive, fn) {
    commands[directive] = fn;
  };
  update.isEquals = function(a, b) { return a === b; };

  return update;

  function update(object, spec) {
    if (typeof spec === 'function') {
      spec = { $apply: spec };
    }

    if (!(Array.isArray(object) && Array.isArray(spec))) {
      invariant_1(
        !Array.isArray(spec),
        'update(): You provided an invalid spec to update(). The spec may ' +
        'not contain an array except as the value of $set, $push, $unshift, ' +
        '$splice or any custom command allowing an array value.'
      );
    }

    invariant_1(
      typeof spec === 'object' && spec !== null,
      'update(): You provided an invalid spec to update(). The spec and ' +
      'every included key path must be plain objects containing one of the ' +
      'following commands: %s.',
      Object.keys(commands).join(', ')
    );

    var nextObject = object;
    getAllKeys(spec).forEach(function(key) {
      if (hasOwnProperty.call(commands, key)) {
        var objectWasNextObject = object === nextObject;
        nextObject = commands[key](spec[key], nextObject, spec, object);
        if (objectWasNextObject && update.isEquals(nextObject, object)) {
          nextObject = object;
        }
      } else {
        var nextValueForKey =
          type(object) === 'Map'
            ? update(object.get(key), spec[key])
            : update(object[key], spec[key]);
        var nextObjectValue =
          type(nextObject) === 'Map'
              ? nextObject.get(key)
              : nextObject[key];
        if (!update.isEquals(nextValueForKey, nextObjectValue) || typeof nextValueForKey === 'undefined' && !hasOwnProperty.call(object, key)) {
          if (nextObject === object) {
            nextObject = copy(object);
          }
          if (type(nextObject) === 'Map') {
            nextObject.set(key, nextValueForKey);
          } else {
            nextObject[key] = nextValueForKey;
          }
        }
      }
    });
    return nextObject;
  }

}

var defaultCommands = {
  $push: function(value, nextObject, spec) {
    invariantPushAndUnshift(nextObject, spec, '$push');
    return value.length ? nextObject.concat(value) : nextObject;
  },
  $unshift: function(value, nextObject, spec) {
    invariantPushAndUnshift(nextObject, spec, '$unshift');
    return value.length ? value.concat(nextObject) : nextObject;
  },
  $splice: function(value, nextObject, spec, originalObject) {
    invariantSplices(nextObject, spec);
    value.forEach(function(args) {
      invariantSplice(args);
      if (nextObject === originalObject && args.length) nextObject = copy(originalObject);
      splice.apply(nextObject, args);
    });
    return nextObject;
  },
  $set: function(value, nextObject, spec) {
    invariantSet(spec);
    return value;
  },
  $toggle: function(targets, nextObject) {
    invariantSpecArray(targets, '$toggle');
    var nextObjectCopy = targets.length ? copy(nextObject) : nextObject;

    targets.forEach(function(target) {
      nextObjectCopy[target] = !nextObject[target];
    });

    return nextObjectCopy;
  },
  $unset: function(value, nextObject, spec, originalObject) {
    invariantSpecArray(value, '$unset');
    value.forEach(function(key) {
      if (Object.hasOwnProperty.call(nextObject, key)) {
        if (nextObject === originalObject) nextObject = copy(originalObject);
        delete nextObject[key];
      }
    });
    return nextObject;
  },
  $add: function(value, nextObject, spec, originalObject) {
    invariantMapOrSet(nextObject, '$add');
    invariantSpecArray(value, '$add');
    if (type(nextObject) === 'Map') {
      value.forEach(function(pair) {
        var key = pair[0];
        var value = pair[1];
        if (nextObject === originalObject && nextObject.get(key) !== value) nextObject = copy(originalObject);
        nextObject.set(key, value);
      });
    } else {
      value.forEach(function(value) {
        if (nextObject === originalObject && !nextObject.has(value)) nextObject = copy(originalObject);
        nextObject.add(value);
      });
    }
    return nextObject;
  },
  $remove: function(value, nextObject, spec, originalObject) {
    invariantMapOrSet(nextObject, '$remove');
    invariantSpecArray(value, '$remove');
    value.forEach(function(key) {
      if (nextObject === originalObject && nextObject.has(key)) nextObject = copy(originalObject);
      nextObject.delete(key);
    });
    return nextObject;
  },
  $merge: function(value, nextObject, spec, originalObject) {
    invariantMerge(nextObject, value);
    getAllKeys(value).forEach(function(key) {
      if (value[key] !== nextObject[key]) {
        if (nextObject === originalObject) nextObject = copy(originalObject);
        nextObject[key] = value[key];
      }
    });
    return nextObject;
  },
  $apply: function(value, original) {
    invariantApply(value);
    return value(original);
  }
};

var contextForExport = newContext();

var _immutabilityHelperEnhanced_2_8_1_immutabilityHelperEnhanced = contextForExport;
var default_1 = contextForExport;
var newContext_1 = newContext;

// invariants

function invariantPushAndUnshift(value, spec, command) {
  invariant_1(
    Array.isArray(value),
    'update(): expected target of %s to be an array; got %s.',
    command,
    value
  );
  invariantSpecArray(spec[command], command);
}

function invariantSpecArray(spec, command) {
  invariant_1(
    Array.isArray(spec),
    'update(): expected spec of %s to be an array; got %s. ' +
    'Did you forget to wrap your parameter in an array?',
    command,
    spec
  );
}

function invariantSplices(value, spec) {
  invariant_1(
    Array.isArray(value),
    'Expected $splice target to be an array; got %s',
    value
  );
  invariantSplice(spec['$splice']);
}

function invariantSplice(value) {
  invariant_1(
    Array.isArray(value),
    'update(): expected spec of $splice to be an array of arrays; got %s. ' +
    'Did you forget to wrap your parameters in an array?',
    value
  );
}

function invariantApply(fn) {
  invariant_1(
    typeof fn === 'function',
    'update(): expected spec of $apply to be a function; got %s.',
    fn
  );
}

function invariantSet(spec) {
  invariant_1(
    Object.keys(spec).length === 1,
    'Cannot have more than one key in an object with $set'
  );
}

function invariantMerge(target, specValue) {
  invariant_1(
    specValue && typeof specValue === 'object',
    'update(): $merge expects a spec of type \'object\'; got %s',
    specValue
  );
  invariant_1(
    target && typeof target === 'object',
    'update(): $merge expects a target of type \'object\'; got %s',
    target
  );
}

function invariantMapOrSet(target, command) {
  var typeOfTarget = type(target);
  invariant_1(
    typeOfTarget === 'Map' || typeOfTarget === 'Set',
    'update(): %s expects a target of type Set or Map; got %s',
    command,
    typeOfTarget
  );
}
_immutabilityHelperEnhanced_2_8_1_immutabilityHelperEnhanced.default = default_1;
_immutabilityHelperEnhanced_2_8_1_immutabilityHelperEnhanced.newContext = newContext_1;var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var NOTHING = typeof Symbol !== "undefined" ? Symbol("immer-nothing") : defineProperty({}, "immer-nothing", true);

var DRAFT_STATE = typeof Symbol !== "undefined" ? Symbol("immer-state") : "__$immer_state";

function isDraft(value) {
    return !!value && !!value[DRAFT_STATE];
}

function isDraftable(value) {
    if (!value) return false;
    if ((typeof value === "undefined" ? "undefined" : _typeof$1(value)) !== "object") return false;
    if (Array.isArray(value)) return true;
    var proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
}

var assign$1 = Object.assign || function assign(target, value) {
    for (var key in value) {
        if (has(value, key)) {
            target[key] = value[key];
        }
    }
    return target;
};

function shallowCopy(value) {
    if (Array.isArray(value)) return value.slice();
    var target = value.__proto__ === undefined ? Object.create(null) : {};
    return assign$1(target, value);
}

function each(value, cb) {
    if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            cb(i, value[i], value);
        }
    } else {
        for (var key in value) {
            cb(key, value[key], value);
        }
    }
}

function has(thing, prop) {
    return Object.prototype.hasOwnProperty.call(thing, prop);
}

function is(x, y) {
    // From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
    if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
    } else {
        return x !== x && y !== y;
    }
}

function generatePatches(state, basePath, patches, inversePatches) {
    Array.isArray(state.base) ? generateArrayPatches(state, basePath, patches, inversePatches) : generateObjectPatches(state, basePath, patches, inversePatches);
}

function generateArrayPatches(state, basePath, patches, inversePatches) {
    var base = state.base,
        copy = state.copy,
        assigned = state.assigned;

    var minLength = Math.min(base.length, copy.length);

    // Look for replaced indices.
    for (var i = 0; i < minLength; i++) {
        if (assigned[i] && base[i] !== copy[i]) {
            var path = basePath.concat(i);
            patches.push({ op: "replace", path: path, value: copy[i] });
            inversePatches.push({ op: "replace", path: path, value: base[i] });
        }
    }

    // Did the array expand?
    if (minLength < copy.length) {
        for (var _i = minLength; _i < copy.length; _i++) {
            patches.push({
                op: "add",
                path: basePath.concat(_i),
                value: copy[_i]
            });
        }
        inversePatches.push({
            op: "replace",
            path: basePath.concat("length"),
            value: base.length
        });
    }

    // ...or did it shrink?
    else if (minLength < base.length) {
            patches.push({
                op: "replace",
                path: basePath.concat("length"),
                value: copy.length
            });
            for (var _i2 = minLength; _i2 < base.length; _i2++) {
                inversePatches.push({
                    op: "add",
                    path: basePath.concat(_i2),
                    value: base[_i2]
                });
            }
        }
}

function generateObjectPatches(state, basePath, patches, inversePatches) {
    var base = state.base,
        copy = state.copy;

    each(state.assigned, function (key, assignedValue) {
        var origValue = base[key];
        var value = copy[key];
        var op = !assignedValue ? "remove" : key in base ? "replace" : "add";
        if (origValue === base && op === "replace") return;
        var path = basePath.concat(key);
        patches.push(op === "remove" ? { op: op, path: path } : { op: op, path: path, value: value });
        inversePatches.push(op === "add" ? { op: "remove", path: path } : op === "remove" ? { op: "add", path: path, value: origValue } : { op: "replace", path: path, value: origValue });
    });
}

function applyPatches(draft, patches) {
    for (var i = 0; i < patches.length; i++) {
        var patch = patches[i];
        var path = patch.path;

        if (path.length === 0 && patch.op === "replace") {
            draft = patch.value;
        } else {
            var base = draft;
            for (var _i3 = 0; _i3 < path.length - 1; _i3++) {
                base = base[path[_i3]];
                if (!base || (typeof base === "undefined" ? "undefined" : _typeof$1(base)) !== "object") throw new Error("Cannot apply patch, path doesn't resolve: " + path.join("/")); // prettier-ignore
            }
            var key = path[path.length - 1];
            switch (patch.op) {
                case "replace":
                case "add":
                    // TODO: add support is not extensive, it does not support insertion or `-` atm!
                    base[key] = patch.value;
                    break;
                case "remove":
                    if (Array.isArray(base)) {
                        if (key !== base.length - 1) throw new Error("Only the last index of an array can be removed, index: " + key + ", length: " + base.length); // prettier-ignore
                        base.length -= 1;
                    } else {
                        delete base[key];
                    }
                    break;
                default:
                    throw new Error("Unsupported patch operation: " + patch.op);
            }
        }
    }
    return draft;
}

// @ts-check

var descriptors = {};

// For nested produce calls:
var scopes = [];
var currentScope = function currentScope() {
    return scopes[scopes.length - 1];
};

function willFinalize(result, baseDraft, needPatches) {
    var scope = currentScope();
    scope.forEach(function (state) {
        return state.finalizing = true;
    });
    if (result === undefined || result === baseDraft) {
        if (needPatches) markChangesRecursively(baseDraft);
        // This is faster when we don't care about which attributes changed.
        markChangesSweep(scope);
    }
}

function createDraft(base, parent) {
    var draft = void 0;
    if (isDraft(base)) {
        var _state = base[DRAFT_STATE];
        // Avoid creating new drafts when copying.
        _state.finalizing = true;
        draft = shallowCopy(_state.draft);
        _state.finalizing = false;
    } else {
        draft = shallowCopy(base);
    }
    each(base, function (prop) {
        Object.defineProperty(draft, "" + prop, createPropertyProxy("" + prop));
    });

    // See "proxy.js" for property documentation.
    var state = {
        scope: parent ? parent.scope : currentScope(),
        modified: false,
        finalizing: false, // es5 only
        finalized: false,
        assigned: {},
        parent: parent,
        base: base,
        draft: draft,
        copy: null,
        revoke: revoke,
        revoked: false // es5 only
    };

    createHiddenProperty(draft, DRAFT_STATE, state);
    state.scope.push(state);
    return draft;
}

function revoke() {
    this.revoked = true;
}

function source(state) {
    return state.copy || state.base;
}

function _get$1(state, prop) {
    assertUnrevoked(state);
    var value = source(state)[prop];
    // Drafts are only created for proxyable values that exist in the base state.
    if (!state.finalizing && value === state.base[prop] && isDraftable(value)) {
        prepareCopy(state);
        return state.copy[prop] = createDraft(value, state);
    }
    return value;
}

function _set$1(state, prop, value) {
    assertUnrevoked(state);
    state.assigned[prop] = true;
    if (!state.modified) {
        if (is(source(state)[prop], value)) return;
        markChanged(state);
        prepareCopy(state);
    }
    state.copy[prop] = value;
}

function markChanged(state) {
    if (!state.modified) {
        state.modified = true;
        if (state.parent) markChanged(state.parent);
    }
}

function prepareCopy(state) {
    if (!state.copy) state.copy = shallowCopy(state.base);
}

function createPropertyProxy(prop) {
    return descriptors[prop] || (descriptors[prop] = {
        configurable: true,
        enumerable: true,
        get: function get$$1() {
            return _get$1(this[DRAFT_STATE], prop);
        },
        set: function set$$1(value) {
            _set$1(this[DRAFT_STATE], prop, value);
        }
    });
}

function assertUnrevoked(state) {
    if (state.revoked === true) throw new Error("Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + JSON.stringify(state.copy || state.base));
}

// This looks expensive, but only proxies are visited, and only objects without known changes are scanned.
function markChangesSweep(scope) {
    // The natural order of drafts in the `scope` array is based on when they
    // were accessed. By processing drafts in reverse natural order, we have a
    // better chance of processing leaf nodes first. When a leaf node is known to
    // have changed, we can avoid any traversal of its ancestor nodes.
    for (var i = scope.length - 1; i >= 0; i--) {
        var state = scope[i];
        if (state.modified === false) {
            if (Array.isArray(state.base)) {
                if (hasArrayChanges(state)) markChanged(state);
            } else if (hasObjectChanges(state)) markChanged(state);
        }
    }
}

function markChangesRecursively(object) {
    if (!object || (typeof object === "undefined" ? "undefined" : _typeof$1(object)) !== "object") return;
    var state = object[DRAFT_STATE];
    if (!state) return;
    var base = state.base,
        draft = state.draft,
        assigned = state.assigned;

    if (!Array.isArray(object)) {
        // Look for added keys.
        Object.keys(draft).forEach(function (key) {
            // The `undefined` check is a fast path for pre-existing keys.
            if (base[key] === undefined && !has(base, key)) {
                assigned[key] = true;
                markChanged(state);
            } else if (!assigned[key]) {
                // Only untouched properties trigger recursion.
                markChangesRecursively(draft[key]);
            }
        });
        // Look for removed keys.
        Object.keys(base).forEach(function (key) {
            // The `undefined` check is a fast path for pre-existing keys.
            if (draft[key] === undefined && !has(draft, key)) {
                assigned[key] = false;
                markChanged(state);
            }
        });
    } else if (hasArrayChanges(state)) {
        markChanged(state);
        assigned.length = true;
        if (draft.length < base.length) {
            for (var i = draft.length; i < base.length; i++) {
                assigned[i] = false;
            }
        } else {
            for (var _i = base.length; _i < draft.length; _i++) {
                assigned[_i] = true;
            }
        }
        for (var _i2 = 0; _i2 < draft.length; _i2++) {
            // Only untouched indices trigger recursion.
            if (assigned[_i2] === undefined) markChangesRecursively(draft[_i2]);
        }
    }
}

function hasObjectChanges(state) {
    var base = state.base,
        draft = state.draft;

    // Search for added keys. Start at the back, because non-numeric keys
    // are ordered by time of definition on the object.

    var keys = Object.keys(draft);
    for (var i = keys.length - 1; i >= 0; i--) {
        // The `undefined` check is a fast path for pre-existing keys.
        if (base[keys[i]] === undefined && !has(base, keys[i])) {
            return true;
        }
    }

    // Since no keys have been added, we can compare lengths to know if an
    // object has been deleted.
    return keys.length !== Object.keys(base).length;
}

function hasArrayChanges(state) {
    var draft = state.draft;

    if (draft.length !== state.base.length) return true;
    // See #116
    // If we first shorten the length, our array interceptors will be removed.
    // If after that new items are added, result in the same original length,
    // those last items will have no intercepting property.
    // So if there is no own descriptor on the last position, we know that items were removed and added
    // N.B.: splice, unshift, etc only shift values around, but not prop descriptors, so we only have to check
    // the last one
    var descriptor = Object.getOwnPropertyDescriptor(draft, draft.length - 1);
    // descriptor can be null, but only for newly created sparse arrays, eg. new Array(10)
    if (descriptor && !descriptor.get) return true;
    // For all other cases, we don't have to compare, as they would have been picked up by the index setters
    return false;
}

function createHiddenProperty(target, prop, value) {
    Object.defineProperty(target, prop, {
        value: value,
        enumerable: false,
        writable: true
    });
}



var legacyProxy = Object.freeze({
	scopes: scopes,
	currentScope: currentScope,
	willFinalize: willFinalize,
	createDraft: createDraft
});

// @ts-check

// For nested produce calls:
var scopes$1 = [];
var currentScope$1 = function currentScope() {
    return scopes$1[scopes$1.length - 1];
};

// Do nothing before being finalized.
function willFinalize$1() {}

function createDraft$1(base, parent) {
    var state = {
        // Track which produce call this is associated with.
        scope: parent ? parent.scope : currentScope$1(),
        // True for both shallow and deep changes.
        modified: false,
        // Used during finalization.
        finalized: false,
        // Track which properties have been assigned (true) or deleted (false).
        assigned: {},
        // The parent draft state.
        parent: parent,
        // The base state.
        base: base,
        // The base proxy.
        draft: null,
        // Any property proxies.
        drafts: {},
        // The base copy with any updated values.
        copy: null,
        // Called by the `produce` function.
        revoke: null
    };

    var _ref = Array.isArray(base) ? Proxy.revocable([state], arrayTraps) : Proxy.revocable(state, objectTraps),
        revoke = _ref.revoke,
        proxy = _ref.proxy;

    state.draft = proxy;
    state.revoke = revoke;

    state.scope.push(state);
    return proxy;
}

var objectTraps = {
    get: get$1,
    has: function has$$1(target, prop) {
        return prop in source$1(target);
    },
    ownKeys: function ownKeys(target) {
        return Reflect.ownKeys(source$1(target));
    },

    set: set$1,
    deleteProperty: deleteProperty,
    getOwnPropertyDescriptor: getOwnPropertyDescriptor,
    defineProperty: defineProperty$1,
    setPrototypeOf: function setPrototypeOf() {
        throw new Error("Immer does not support `setPrototypeOf()`.");
    }
};

var arrayTraps = {};
each(objectTraps, function (key, fn) {
    arrayTraps[key] = function () {
        arguments[0] = arguments[0][0];
        return fn.apply(this, arguments);
    };
});
arrayTraps.deleteProperty = function (state, prop) {
    if (isNaN(parseInt(prop))) throw new Error("Immer does not support deleting properties from arrays: " + prop);
    return objectTraps.deleteProperty.call(this, state[0], prop);
};
arrayTraps.set = function (state, prop, value) {
    if (prop !== "length" && isNaN(parseInt(prop))) throw new Error("Immer does not support setting non-numeric properties on arrays: " + prop);
    return objectTraps.set.call(this, state[0], prop, value);
};

function source$1(state) {
    return state.copy || state.base;
}

function get$1(state, prop) {
    if (prop === DRAFT_STATE) return state;
    var drafts = state.drafts;

    // Check for existing draft in unmodified state.

    if (!state.modified && has(drafts, prop)) {
        return drafts[prop];
    }

    var value = source$1(state)[prop];
    if (state.finalized || !isDraftable(value)) return value;

    // Check for existing draft in modified state.
    if (state.modified) {
        // Assigned values are never drafted. This catches any drafts we created, too.
        if (value !== state.base[prop]) return value;
        // Store drafts on the copy (when one exists).
        drafts = state.copy;
    }

    return drafts[prop] = createDraft$1(value, state);
}

function set$1(state, prop, value) {
    if (!state.modified) {
        // Optimize based on value's truthiness. Truthy values are guaranteed to
        // never be undefined, so we can avoid the `in` operator. Lastly, truthy
        // values may be drafts, but falsy values are never drafts.
        var isUnchanged = value ? is(state.base[prop], value) || value === state.drafts[prop] : is(state.base[prop], value) && prop in state.base;
        if (isUnchanged) return true;
        markChanged$1(state);
    }
    state.assigned[prop] = true;
    state.copy[prop] = value;
    return true;
}

function deleteProperty(state, prop) {
    // The `undefined` check is a fast path for pre-existing keys.
    if (state.base[prop] !== undefined || prop in state.base) {
        state.assigned[prop] = false;
        markChanged$1(state);
    }
    if (state.copy) delete state.copy[prop];
    return true;
}

function getOwnPropertyDescriptor(state, prop) {
    var owner = state.modified ? state.copy : has(state.drafts, prop) ? state.drafts : state.base;
    var descriptor = Reflect.getOwnPropertyDescriptor(owner, prop);
    if (descriptor && !(Array.isArray(owner) && prop === "length")) descriptor.configurable = true;
    return descriptor;
}

function defineProperty$1() {
    throw new Error("Immer does not support defining properties on draft objects.");
}

function markChanged$1(state) {
    if (!state.modified) {
        state.modified = true;
        state.copy = assign$1(shallowCopy(state.base), state.drafts);
        state.drafts = null;
        if (state.parent) markChanged$1(state.parent);
    }
}

var modernProxy = Object.freeze({
	scopes: scopes$1,
	currentScope: currentScope$1,
	willFinalize: willFinalize$1,
	createDraft: createDraft$1
});

function verifyMinified() {}

var configDefaults = {
    useProxies: typeof Proxy !== "undefined" && typeof Reflect !== "undefined",
    autoFreeze: typeof process !== "undefined" ? process.env.NODE_ENV !== "production" : verifyMinified.name === "verifyMinified",
    onAssign: null,
    onDelete: null,
    onCopy: null
};

var Immer = function () {
    function Immer(config) {
        classCallCheck(this, Immer);

        assign$1(this, configDefaults, config);
        this.setUseProxies(this.useProxies);
        this.produce = this.produce.bind(this);
    }

    createClass(Immer, [{
        key: "produce",
        value: function produce(base, recipe, patchListener) {
            var _this = this;

            // curried invocation
            if (typeof base === "function" && typeof recipe !== "function") {
                var defaultBase = recipe;
                recipe = base;

                // prettier-ignore
                return function () {
                    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        args[_key - 1] = arguments[_key];
                    }

                    var base = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultBase;
                    return _this.produce(base, function (draft) {
                        var _recipe;

                        return (_recipe = recipe).call.apply(_recipe, [draft, draft].concat(args));
                    });
                };
            }

            // prettier-ignore
            {
                if (typeof recipe !== "function") throw new Error("if first argument is not a function, the second argument to produce should be a function");
                if (patchListener !== undefined && typeof patchListener !== "function") throw new Error("the third argument of a producer should not be set or a function");
            }

            var result = void 0;
            // Only create proxies for plain objects/arrays.
            if (!isDraftable(base)) {
                result = recipe(base);
                if (result === undefined) return base;
            }
            // See #100, don't nest producers
            else if (isDraft(base)) {
                    result = recipe.call(base, base);
                    if (result === undefined) return base;
                }
                // The given value must be proxied.
                else {
                        this.scopes.push([]);
                        var baseDraft = this.createDraft(base);
                        try {
                            result = recipe.call(baseDraft, baseDraft);
                            this.willFinalize(result, baseDraft, !!patchListener);

                            // Never generate patches when no listener exists.
                            var patches = patchListener && [],
                                inversePatches = patchListener && [];

                            // Finalize the modified draft...
                            if (result === undefined || result === baseDraft) {
                                result = this.finalize(baseDraft, [], patches, inversePatches);
                            }
                            // ...or use a replacement value.
                            else {
                                    // Users must never modify the draft _and_ return something else.
                                    if (baseDraft[DRAFT_STATE].modified) throw new Error("An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft."); // prettier-ignore

                                    // Finalize the replacement in case it contains (or is) a subset of the draft.
                                    if (isDraftable(result)) result = this.finalize(result);

                                    if (patchListener) {
                                        patches.push({
                                            op: "replace",
                                            path: [],
                                            value: result
                                        });
                                        inversePatches.push({
                                            op: "replace",
                                            path: [],
                                            value: base
                                        });
                                    }
                                }
                        } finally {
                            this.currentScope().forEach(function (state) {
                                return state.revoke();
                            });
                            this.scopes.pop();
                        }
                        patchListener && patchListener(patches, inversePatches);
                    }
            // Normalize the result.
            return result === NOTHING ? undefined : result;
        }
    }, {
        key: "setAutoFreeze",
        value: function setAutoFreeze(value) {
            this.autoFreeze = value;
        }
    }, {
        key: "setUseProxies",
        value: function setUseProxies(value) {
            this.useProxies = value;
            assign$1(this, value ? modernProxy : legacyProxy);
        }
        /**
         * @internal
         * Finalize a draft, returning either the unmodified base state or a modified
         * copy of the base state.
         */

    }, {
        key: "finalize",
        value: function finalize(draft, path, patches, inversePatches) {
            var state = draft[DRAFT_STATE];
            if (!state) {
                if (Object.isFrozen(draft)) return draft;
                return this.finalizeTree(draft);
            }
            // Never finalize drafts owned by an outer scope.
            if (state.scope !== this.currentScope()) {
                return draft;
            }
            if (!state.modified) return state.base;
            if (!state.finalized) {
                state.finalized = true;
                this.finalizeTree(state.draft, path, patches, inversePatches);
                if (this.onDelete) {
                    var assigned = state.assigned;

                    for (var prop in assigned) {
                        assigned[prop] || this.onDelete(state, prop);
                    }
                }
                if (this.onCopy) this.onCopy(state);

                // Nested producers must never auto-freeze their result,
                // because it may contain drafts from parent producers.
                if (this.autoFreeze && this.scopes.length === 1) {
                    Object.freeze(state.copy);
                }

                if (patches) generatePatches(state, path, patches, inversePatches);
            }
            return state.copy;
        }
        /**
         * @internal
         * Finalize all drafts in the given state tree.
         */

    }, {
        key: "finalizeTree",
        value: function finalizeTree(root, path, patches, inversePatches) {
            var _this2 = this;

            var state = root[DRAFT_STATE];
            if (state) {
                root = this.useProxies ? state.copy : state.copy = shallowCopy(state.draft);
            }

            var onAssign = this.onAssign;

            var finalizeProperty = function finalizeProperty(prop, value, parent) {
                // Only `root` can be a draft in here.
                var inDraft = !!state && parent === root;

                if (isDraft(value)) {
                    // prettier-ignore
                    parent[prop] = value =
                    // Patches are never generated for assigned properties.
                    patches && inDraft && !state.assigned[prop] ? _this2.finalize(value, path.concat(prop), patches, inversePatches) : _this2.finalize(value);

                    // Unchanged drafts are ignored.
                    if (inDraft && value === state.base[prop]) return;
                }
                // Unchanged draft properties are ignored.
                else if (inDraft && is(value, state.base[prop])) {
                        return;
                    }
                    // Search new objects for unfinalized drafts. Frozen objects should never contain drafts.
                    else if (isDraftable(value) && !Object.isFrozen(value)) {
                            each(value, finalizeProperty);
                        }

                if (inDraft && onAssign) {
                    onAssign(state, prop, value);
                }
            };

            each(root, finalizeProperty);
            return root;
        }
    }]);
    return Immer;
}();

var immer = new Immer();

/**
 * The `produce` function takes a value and a "recipe function" (whose
 * return value often depends on the base state). The recipe function is
 * free to mutate its first argument however it wants. All mutations are
 * only ever applied to a __copy__ of the base state.
 *
 * Pass only a function to create a "curried producer" which relieves you
 * from passing the recipe function every time.
 *
 * Only plain objects and arrays are made mutable. All other objects are
 * considered uncopyable.
 *
 * Note: This function is __bound__ to its `Immer` instance.
 *
 * @param {any} base - the initial state
 * @param {Function} producer - function that receives a proxy of the base state as first argument and which can be freely modified
 * @param {Function} patchListener - optional function that will be called with all the patches produced here
 * @returns {any} a new state, or the initial state if nothing was modified
 */
var produce = immer.produce;

/**
 * Apply an array of Immer patches to the first argument.
 *
 * This function is a producer, which means copy-on-write is in effect.
 */
var applyPatches$1 = produce(applyPatches);/**
 * @desc 从一个对象通过操作序列来拿里面的值，做了基本防空措施
 * @param {object} state - 需要获取的数据源
 * @param {array} array - 操作路径
 * @param {any} initial - 默认值，当没有内容的时候
 * @example <caption>Example usage of getIn.</caption>
 * // testcase
 * {%common%}
 * // getIn
 * {%getIn%}
 * @returns {any} expected - 获取的值
 */

function getIn(state, array) {
  var initial = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var obj = Object.assign({}, state);

  for (var i = 0; i < array.length; i++) {
    // when is undefined return init immediately
    if (_typeof(obj) !== 'object' || obj === null) {
      return initial;
    }

    var prop = array[i];
    obj = obj[prop];
  }

  if (obj === undefined || obj === null) {
    return initial;
  }

  return obj;
}
/**
 * @desc 一个对象通过操作序列来设置里面的值，做到自动添加值
 * @param {object} state - 需要获取的数据源
 * @param {array} array - 操作路径
 * @param {any} initial - 默认值，当没有内容的时候
 * @example <caption>Example usage of setIn.</caption>
 * // testcase
 * {%common%}
 * // setIn
 * {%setIn%}
 * @returns {any} expected - 返回操作完成后新的值
 */

function setIn(state, array, value) {
  if (!array) return state;

  var setRecursively = function setRecursively(state, array, value, index) {
    var clone = {};
    var prop = array[index];
    var newState;

    if (array.length > index) {
      // get cloned object
      if (isArray(state)) {
        clone = state.slice(0);
      } else {
        clone = Object.assign({}, state);
      } // not exists, make new {}


      newState = (isObject(state) || isArray(state)) && state[prop] !== undefined ? state[prop] : {};
      clone[prop] = setRecursively(newState, array, value, index + 1);
      return clone;
    }

    return value;
  };

  return setRecursively(state, array, value, 0);
}
/**
 * @desc 一个对象通过操作序列来删除里面的值, 做到防空, 返回新值
 * @param {object} state - 需要获取的数据源
 * @param {array} array - 操作路径
 * @example <caption>Example usage of deleteIn.</caption>
 * // testcase
 * {%common%}
 * // deleteIn
 * {%deleteIn%}
 * @returns {any} expected - 返回删除后新的对象 or 值
 */

function deleteIn(state, array) {
  var deleteRecursively = function deleteRecursively(state, array, index) {
    var clone = {};
    var prop = array[index]; // not exists, just return, delete nothing

    if (!isObject(state) || state[prop] === undefined) {
      return state;
    } // not last one, just clone


    if (array.length - 1 !== index) {
      if (Array.isArray(state)) {
        clone = state.slice();
      } else {
        clone = Object.assign({}, state);
      }

      clone[prop] = deleteRecursively(state[prop], array, index + 1);
      return clone;
    } // delete here


    if (Array.isArray(state)) {
      clone = [].concat(state.slice(0, prop), state.slice(prop + 1));
    } else {
      clone = Object.assign({}, state);
      delete clone[prop];
    }

    return clone;
  };

  return deleteRecursively(state, array, 0);
}
/**
 * @desc 将一组操作通过 array 的形式 reduce 组合
 * @param {array} array - 组合方式
 * @example <caption>Example usage of compose.</caption>
 * {%compose%}
 */

function compose(array) {
  return array.reduce(function (p, v) {
    if (isFunc(v)) {
      return v(p);
    }

    if (isArray(v) && isFunc(v[0])) {
      return v[0].apply(v, [p].concat(_toConsumableArray(v.slice(1))));
    }

    return p;
  });
}function wrapDataInstance () {
  var instance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var context = arguments.length > 1 ? arguments[1] : undefined;

  instance.getIn = function (path, initial) {
    var ctx = context ? context.data : this;
    var pathArray = isString(path) ? [path] : path;
    var result = getIn(ctx, pathArray, initial);

    for (var _len = arguments.length, funcs = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      funcs[_key - 2] = arguments[_key];
    }

    if (funcs.length) {
      return compose([result].concat(funcs));
    }

    return result;
  };

  instance.setIn = function (path, initial) {
    var ctx = context ? context.data : this;
    var pathArray = isString(path) ? [path] : path;
    return setIn(ctx, pathArray, initial);
  };

  instance.deleteIn = function (path) {
    var ctx = context ? context.data : this;
    var pathArray = isString(path) ? [path] : path;
    return deleteIn(ctx, pathArray);
  }; // use immutablity helper


  instance.$update = function (manipulate) {
    var ctx = context ? context.data : this;
    return _immutabilityHelperEnhanced_2_8_1_immutabilityHelperEnhanced(ctx, manipulate);
  }; // use immer


  instance.$produce = function (manipulate) {
    var ctx = context ? context.data : this;
    return produce(ctx, manipulate);
  };

  instance.compose = function () {
    var ctx = context ? context.data : this;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var composeArray = isArray(args[0]) ? args[0] : args;
    composeArray.unshift(ctx);
    return compose(composeArray);
  };

  return instance;
}var reserveWord = ['getIn', 'setIn', 'deleteIn', '$update', '$produce', 'compose'];

function omit(data) {
  return Object.keys(data).filter(function (d) {
    return reserveWord.indexOf(d) < 0;
  }).reduce(function (p, v) {
    p[v] = data[v];
    return p;
  }, {});
} // 打印时去除这类无聊信息


function wrapState(state) {
  var filteredNewState = omit(state);

  if (filteredNewState.$getters) {
    filteredNewState.$getters = omit(filteredNewState.$getters);
  }

  if (filteredNewState.$global) {
    filteredNewState.$global = omit(filteredNewState.$global);
  }

  return filteredNewState;
}var Global =
/*#__PURE__*/
function () {
  function Global() {
    _classCallCheck(this, Global);

    this.emitter = new EventEmitter();
    this.storeInstances = {};
    this.components = {};
    this.globalStoreConfig = {
      state: {}
    };
    this.messageChannel = {};
    this.router = {
      currentPath: '',
      query: null,
      context: {},
      from: '',
      viewId: '',
      fromViewId: ''
    };
    var that = this;
    this.emitter.addListener('updateCurrentPath', function (path) {
      Object.assign(that.router, path);

      var prevState = _objectSpread({}, that.globalStoreConfig.state); // console.info(`%c mutation: ROUTER`, 'color: #03A9F4; font-weight: bold', { ...that.router }, new Date().getTime());


      Object.assign(that.globalStoreConfig.state, {
        $router: that.router
      });

      var nextState = _objectSpread({}, that.globalStoreConfig.state);

      that.emitter.emitEvent('updateGlobalStore', {
        nextState: nextState,
        prevState: prevState,
        type: '$global:handleRouterChanged',
        payload: _objectSpread({}, path)
      });
    });
    this.emitter.addListener('updateState', function (data) {
      var state = data.state,
          mutation = data.mutation;

      var prevState = _objectSpread({}, that.globalStoreConfig.state);

      Object.assign(that.globalStoreConfig.state, state);

      var nextState = _objectSpread({}, that.globalStoreConfig.state);

      that.emitter.emitEvent('updateGlobalStore', {
        nextState: nextState,
        prevState: prevState,
        mutation: mutation
      });
    });
    this.messageManager = {
      clear: this.clearMessage.bind(this),
      push: this.pushMessage.bind(this),
      pop: this.popMessage.bind(this)
    };
  }

  _createClass(Global, [{
    key: "subscribe",
    value: function subscribe(subscriber, actionSubscriber) {
      this.emitter.addListener('updateGlobalStore', function (_ref) {
        var nextState = _ref.nextState,
            prevState = _ref.prevState,
            _ref$mutation = _ref.mutation,
            mutation = _ref$mutation === void 0 ? {} : _ref$mutation;
        subscriber && subscriber(mutation, wrapState(nextState), wrapState(prevState));
      }); // if (actionSubscriber) {
      //   emitter.addListener('dispatchAction', (action) => {
      //     actionSubscriber(action);
      //   });
      // }
    }
  }, {
    key: "getGlobalState",
    value: function getGlobalState(mapGlobalToState) {
      var state = wrapDataInstance(this.globalStoreConfig.state);

      if (mapGlobalToState) {
        return mapGlobalToState(state);
      }

      return state;
    }
  }, {
    key: "clearMessage",
    value: function clearMessage(channel) {
      if (this.messageChannel[channel]) {
        this.messageChannel[channel] = [];
      }
    }
  }, {
    key: "pushMessage",
    value: function pushMessage(channel, payload) {
      if (this.messageChannel[channel]) {
        this.messageChannel[channel].push(payload);
      } else {
        this.messageChannel[channel] = [payload];
      }
    }
  }, {
    key: "popMessage",
    value: function popMessage(channel) {
      if (this.messageChannel[channel]) {
        return this.messageChannel[channel].pop();
      } else {
        return null;
      }
    }
  }, {
    key: "getCurrentPath",
    value: function getCurrentPath() {
      return this.router.currentPath;
    }
  }, {
    key: "getCurrentViewId",
    value: function getCurrentViewId() {
      return this.router.viewId;
    }
  }, {
    key: "setGlobalStoreConfig",
    value: function setGlobalStoreConfig(data) {
      var _this = this;

      this.globalStoreConfig = data;
      this.instanceName = 'global';

      if (this.globalStoreConfig.plugins) {
        this.globalStoreConfig.plugins.forEach(function (plugin) {
          var pluginFunc = isString(plugin) ? _innerPlugins[plugin] : plugin;
          pluginFunc(_this);
        });
      }
    }
  }, {
    key: "registerComponents",
    value: function registerComponents(name, instance) {
      this.components[name] = instance;
    }
  }, {
    key: "getComponentRef",
    value: function getComponentRef(name) {
      if (!this.components[name]) {
        console.warn("\u672A\u627E\u5230".concat(name, "\u7EC4\u4EF6\uFF0C\u8BF7\u68C0\u67E5\u7EC4\u4EF6\u540D\u662F\u5426\u6B63\u786E\uFF0C\u662F\u5426\u5728onReady\u540E\u4F7F\u7528"));
        return null;
      }

      return this.components[name];
    }
  }, {
    key: "registerInstance",
    value: function registerInstance(name, instance) {
      this.storeInstances[name] = instance;
    }
  }, {
    key: "getInstance",
    value: function getInstance(name) {
      return this.storeInstances[name];
    }
  }, {
    key: "getInstanceByViewId",
    value: function getInstanceByViewId(id) {
      // 通过 viewid 找
      var target = Object.values(this.storeInstances).find(function (i) {
        return i.viewId === id;
      });
      return target;
    }
  }, {
    key: "getState",
    value: function getState(name) {
      var target = this.storeInstances[name];

      if (target) {
        var store = target.store;
        var instance = store.getInstance();
        return instance.data;
      }

      return null;
    }
  }]);

  return Global;
}();

var global = new Global();function filterObjectByKey(array, object) {
  return array.reduce(function (p, v) {
    if (object && object[v] !== undefined) {
      p[v] = object[v];
    }

    return p;
  }, {});
}
function mapGettersToState(state) {
  var getters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var store = arguments.length > 2 ? arguments[2] : undefined;

  var result = _objectSpread({}, state);

  result.$getters = Object.keys(getters).reduce(function (p, v) {
    var funcExec = getters[v];
    p[v] = {};
    Object.defineProperty(p, v, {
      get: function get() {
        var globalData = store.connectGlobal ? global.getGlobalState(store.mapGlobal) : {};
        var instance = store.getInstance() ? store.getInstance().state || {} : this || {};

        if (isFunc(funcExec)) {
          var params = filterObjectByKey(Object.keys(state), instance);
          return funcExec.call(this, wrapDataInstance(params), wrapDataInstance(instance.$getters), wrapDataInstance(globalData), global.getState);
        }

        return funcExec;
      }
    });
    return p;
  }, {});
  return result;
}function startsWith(data, search, pos) {
  return data.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
}

function dispatchActionPromise(instance, args) {
  return new Promise(function (resolve, reject) {
    try {
      instance.emitEventChain('dispatchAction', args, function (d) {
        resolve(d);
      });
    } catch (e) {
      reject(e);
    }
  });
} // 保证每次更改 store 是 immutable 的


var innerMutation = {
  $setIn: function $setIn(s, d) {
    return setIn(s, d.path, d.value);
  },
  $update: function $update(s, o) {
    return _immutabilityHelperEnhanced_2_8_1_immutabilityHelperEnhanced(s, o);
  },
  $deleteIn: function $deleteIn(s, d) {
    return deleteIn(s, d);
  },
  $resetStore: function $resetStore() {
    var _global$getInstanceBy = global.getInstanceByViewId(global.getCurrentViewId()),
        config = _global$getInstanceBy.config;

    var next = _objectSpread({}, config.state);

    return next;
  }
};

function mutationHandler(func, state, payload, innerHelper) {
  if (innerHelper) {
    func = isFunc(innerHelper) ? func || innerHelper : func || innerMutation[innerHelper];
  }

  if (!func) {
    return payload;
  }

  var payloadWithHelper = wrapDataInstance(payload);

  if (func._shouldImmutable) {
    return produce(state, function (draftState) {
      func(draftState, payloadWithHelper);
    });
  }

  var result = func(state, payloadWithHelper); // 确保return的值是一个新对象

  return result === state ? _objectSpread({}, result) : result;
}

function commitGlobal(type, payload, innerHelper) {
  var _global$globalStoreCo = global.globalStoreConfig.mutations,
      mutations = _global$globalStoreCo === void 0 ? {} : _global$globalStoreCo;

  if (!type) {
    throw new Error("not found ".concat(type, " action"));
  }

  if (isObject(type)) {
    payload = type;
    type = 'update';
  }

  var finalMutation = mutationHandler(mutations[type], global.getGlobalState(), payload, innerHelper);
  var tmp = {
    state: finalMutation,
    mutation: {
      type: "$global:".concat(type),
      payload: payload
    }
  };
  global.emitter.emitEvent('updateState', tmp); // commit 的结果是一个同步行为

  return global.getGlobalState();
}

function dispatchGlobal(_x, _x2) {
  return _dispatchGlobal.apply(this, arguments);
}

function _dispatchGlobal() {
  _dispatchGlobal = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(type, payload) {
    var _global$globalStoreCo2, actions, actionFunc, self, res;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _global$globalStoreCo2 = global.globalStoreConfig.actions, actions = _global$globalStoreCo2 === void 0 ? {} : _global$globalStoreCo2;
            actionFunc = actions[type];
            self = this;
            res = {};
            _context3.next = 6;
            return dispatchActionPromise(global.emitter, {
              type: type,
              payload: payload
            });

          case 6:
            res = _context3.sent;

            if (actionFunc) {
              _context3.next = 10;
              break;
            }

            console.warn('not found action', type, actions);
            return _context3.abrupt("return", Promise.resolve(res));

          case 10:
            _context3.t0 = actionFunc;
            _context3.t1 = self;
            _context3.t2 = commitGlobal.bind(self);
            _context3.t3 = dispatchGlobal.bind(self);
            _context3.t4 = global.messageManager;

            _context3.t5 = function put(type) {
              var func = actions[type];

              if (!func) {
                throw new Error("not found ".concat(type, " action"));
              }

              if (func) {
                for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                  args[_key3 - 1] = arguments[_key3];
                }

                func.apply(self, args);
              }
            };

            _context3.t6 = function getRef(name) {
              return global.getComponentRef(name);
            };

            _context3.t7 = function select(filter) {
              return filter(wrapDataInstance(_objectSpread({}, global.getGlobalState())));
            };

            _context3.t8 = function getState(instanceName) {
              if (!instanceName) {
                return wrapDataInstance(global.getGlobalState());
              }

              return global.getState(instanceName);
            };

            _context3.t9 = {
              commit: _context3.t2,
              dispatch: _context3.t3,
              message: _context3.t4,
              put: _context3.t5,

              get state() {
                return wrapDataInstance(global.getGlobalState());
              },

              get getters() {
                return wrapDataInstance(global.getGlobalState().$getters);
              },

              get global() {
                return wrapDataInstance(global.getGlobalState());
              },

              getRef: _context3.t6,
              select: _context3.t7,
              getState: _context3.t8
            };
            _context3.t10 = wrapDataInstance(payload);
            _context3.next = 23;
            return _context3.t0.call.call(_context3.t0, _context3.t1, _context3.t9, _context3.t10);

          case 23:
            res = _context3.sent;

            if (!(res instanceof Promise)) {
              _context3.next = 26;
              break;
            }

            return _context3.abrupt("return", res);

          case 26:
            return _context3.abrupt("return", Promise.resolve(res));

          case 27:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return _dispatchGlobal.apply(this, arguments);
}

function getConfigFromGlobal(global$$1, key) {
  var targetInstanceObj = global$$1.getInstance(key || global$$1.getCurrentViewId());
  var instance = targetInstanceObj ? targetInstanceObj.store.getInstance() : {};
  return _objectSpread({}, targetInstanceObj.config, {
    instance: instance
  });
}

function getConfigFromInstance(target) {
  return {
    mutations: target.mutations,
    actions: target.actions,
    instance: target.getInstance()
  };
}

function createConnectHelpers(global$$1, key) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return {
    commitGlobal: commitGlobal.bind(this),
    dispatchGlobal: dispatchGlobal.bind(this),
    commit: function commit(type, payload, innerHelper) {
      var finalKey = key || global$$1.getCurrentPath() || global$$1.getCurrentViewId() || -1;

      var _ref = global$$1.storeInstance ? getConfigFromInstance(global$$1) : getConfigFromGlobal(global$$1, finalKey),
          instance = _ref.instance,
          _ref$mutations = _ref.mutations,
          mutations = _ref$mutations === void 0 ? {} : _ref$mutations;

      Object.assign(mutations, config.mutations);

      if (!type) {
        throw new Error("".concat(type, " not found"));
      }

      if (isObject(type)) {
        payload = type;
        type = 'update';
      }

      if (isString(type) && startsWith(type, '$global:')) {
        var realType = type.split(':').pop();
        return commitGlobal.call(instance, realType, payload);
      }

      var prevState = _objectSpread({}, instance.data);

      var finalMutation = mutationHandler(mutations[type], wrapDataInstance(instance.data), payload, innerHelper);
      instance.$emitter.emitEvent('updateState', {
        state: finalMutation,
        mutation: {
          type: type,
          payload: payload
        },
        prevState: prevState
      }); // commit 的结果是一个同步行为

      return instance.data;
    },
    dispatch: function () {
      var _dispatch = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(type, payload) {
        var finalKey, _ref2, instance, _ref2$mutations, mutations, _ref2$actions, actions, realType, actionFunc, self, res;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                finalKey = key || global$$1.getCurrentPath() || global$$1.getCurrentViewId() || -1;
                _ref2 = global$$1.storeInstance ? getConfigFromInstance(global$$1) : getConfigFromGlobal(global$$1, finalKey), instance = _ref2.instance, _ref2$mutations = _ref2.mutations, mutations = _ref2$mutations === void 0 ? {} : _ref2$mutations, _ref2$actions = _ref2.actions, actions = _ref2$actions === void 0 ? {} : _ref2$actions;

                if (type) {
                  _context.next = 4;
                  break;
                }

                throw new Error('action type not found');

              case 4:
                if (!(isString(type) && startsWith(type, '$global:'))) {
                  _context.next = 7;
                  break;
                }

                realType = type.split(':').pop();
                return _context.abrupt("return", dispatchGlobal.call(this, realType, payload));

              case 7:
                // 获取目标 instance 的数据
                Object.assign(mutations, config.mutations);
                Object.assign(actions, config.actions);
                actionFunc = actions[type];
                self = this;
                res = {};
                _context.next = 14;
                return dispatchActionPromise(instance.$emitter, {
                  type: type,
                  payload: payload
                });

              case 14:
                res = _context.sent;

                if (actionFunc) {
                  _context.next = 18;
                  break;
                }

                console.warn('not found action', type, actions);
                return _context.abrupt("return", Promise.resolve(res));

              case 18:
                _context.t0 = actionFunc;
                _context.t1 = self;
                _context.t2 = this.commit.bind(self);
                _context.t3 = this.dispatch.bind(self);
                _context.t4 = global$$1.messageManager;
                _context.t5 = dispatchGlobal.bind(self);
                _context.t6 = commitGlobal.bind(self);

                _context.t7 = function put(type) {
                  var func = actions[type];

                  if (!func) {
                    throw new Error("not found ".concat(type, " action"));
                  }

                  if (func) {
                    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                      args[_key - 1] = arguments[_key];
                    }

                    func.apply(self, args);
                  }
                };

                _context.t8 = function getRef(name) {
                  return global$$1.getComponentRef(name);
                };

                _context.t9 = function getState(instanceName) {
                  if (!instanceName) {
                    return wrapDataInstance(instance.data, self);
                  }

                  return global$$1.getState(instanceName);
                };

                _context.t10 = function select(filter) {
                  return filter(wrapDataInstance(_objectSpread({}, instance.data)));
                };

                _context.t11 = {
                  commit: _context.t2,
                  dispatch: _context.t3,
                  message: _context.t4,
                  dispatchGlobal: _context.t5,
                  commitGlobal: _context.t6,
                  put: _context.t7,

                  get state() {
                    return wrapDataInstance(instance.data, self);
                  },

                  get getters() {
                    return wrapDataInstance(instance.data.$getters, self);
                  },

                  get global() {
                    return wrapDataInstance(instance.data.$global);
                  },

                  getRef: _context.t8,
                  getState: _context.t9,
                  select: _context.t10
                };
                _context.t12 = wrapDataInstance(payload);
                _context.next = 33;
                return _context.t0.call.call(_context.t0, _context.t1, _context.t11, _context.t12);

              case 33:
                res = _context.sent;

                if (!(res instanceof Promise)) {
                  _context.next = 36;
                  break;
                }

                return _context.abrupt("return", res);

              case 36:
                return _context.abrupt("return", Promise.resolve(res));

              case 37:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function dispatch(_x3, _x4) {
        return _dispatch.apply(this, arguments);
      }

      return dispatch;
    }()
  };
} // 创建 commit 和 dispatch instance

function createHelpers(actions, mutationsObj, emitter, getInstance) {
  var mutations = Object.assign({}, mutationsObj, innerMutation);
  return {
    commitGlobal: commitGlobal.bind(this),
    dispatchGlobal: dispatchGlobal.bind(this),
    commit: function commit(type, payload, innerHelper) {
      if (!type) {
        throw new Error("not found ".concat(type, " action"));
      }

      if (isObject(type)) {
        payload = type;
        type = 'update';
      }

      if (isString(type) && startsWith(type, '$global:')) {
        var realType = type.split(':').pop();
        return commitGlobal.call(this, realType, payload);
      }

      var prevState = _objectSpread({}, this.data);

      var finalMutation = mutationHandler(mutations[type], wrapDataInstance(this.data), payload, innerHelper); // 触发更新机制

      emitter.emitEvent('updateState', {
        state: finalMutation,
        mutation: {
          type: type,
          payload: payload
        },
        prevState: prevState
      }); // commit 的结果是一个同步行为，返回值

      return this.data;
    },
    dispatch: function () {
      var _dispatch2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(type, payload) {
        var actionCache, realType, actionFunc, self, res;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                actionCache = Object.assign({}, actions, this);

                if (type) {
                  _context2.next = 3;
                  break;
                }

                throw new Error('action type not found');

              case 3:
                if (!(isString(type) && startsWith(type, '$global:'))) {
                  _context2.next = 6;
                  break;
                }

                realType = type.split(':').pop();
                return _context2.abrupt("return", dispatchGlobal.call(this, realType, payload));

              case 6:
                actionFunc = actionCache[type];
                self = this;
                res = {};
                _context2.next = 11;
                return dispatchActionPromise(emitter, {
                  type: type,
                  payload: payload
                });

              case 11:
                res = _context2.sent;

                if (actionFunc) {
                  _context2.next = 15;
                  break;
                }

                console.warn('not found action', type, actions);
                return _context2.abrupt("return", Promise.resolve(res));

              case 15:
                _context2.t0 = actionFunc;
                _context2.t1 = self;
                _context2.t2 = this.commit.bind(self);
                _context2.t3 = this.dispatch.bind(self);
                _context2.t4 = dispatchGlobal.bind(self);
                _context2.t5 = commitGlobal.bind(self);
                _context2.t6 = global.messageManager;

                _context2.t7 = function put(type) {
                  var func = actionCache[type];

                  if (!func) {
                    throw new Error("not found ".concat(type, " action"));
                  }

                  if (func) {
                    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                      args[_key2 - 1] = arguments[_key2];
                    }

                    func.apply(self, args);
                  }
                };

                _context2.t8 = function getRef(name) {
                  return global.getComponentRef(name);
                };

                _context2.t9 = function getState(instanceName) {
                  if (!instanceName) {
                    return wrapDataInstance(self.data, self);
                  }

                  return global.getState(instanceName);
                };

                _context2.t10 = function select(filter) {
                  return filter(wrapDataInstance(_objectSpread({}, self.data)));
                };

                _context2.t11 = {
                  commit: _context2.t2,
                  dispatch: _context2.t3,
                  dispatchGlobal: _context2.t4,
                  commitGlobal: _context2.t5,
                  message: _context2.t6,
                  put: _context2.t7,

                  get state() {
                    return wrapDataInstance(self.data, self);
                  },

                  get getters() {
                    return wrapDataInstance(self.data.$getters, self);
                  },

                  get global() {
                    return wrapDataInstance(self.data.$global);
                  },

                  getRef: _context2.t8,
                  getState: _context2.t9,
                  select: _context2.t10
                };
                _context2.t12 = wrapDataInstance(payload);
                _context2.next = 30;
                return _context2.t0.call.call(_context2.t0, _context2.t1, _context2.t11, _context2.t12);

              case 30:
                res = _context2.sent;

                if (!(res instanceof Promise)) {
                  _context2.next = 33;
                  break;
                }

                return _context2.abrupt("return", res);

              case 33:
                return _context2.abrupt("return", Promise.resolve(res));

              case 34:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function dispatch(_x5, _x6) {
        return _dispatch2.apply(this, arguments);
      }

      return dispatch;
    }()
  };
}function setDataByStateProps(mapStateToProps) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var config = arguments.length > 2 ? arguments[2] : undefined;
  var mapGettersToProps = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var instance = arguments.length > 4 ? arguments[4] : undefined;
  var next = arguments.length > 5 ? arguments[5] : undefined;
  var gettersState = {}; // data 是增量

  var finalData = next ? instance.data : data;
  var stateToExpose = wrapDataInstance(_objectSpread({}, finalData));
  var gettersToExpose = wrapDataInstance(_objectSpread({}, finalData.$getters));
  var shouldUpdateKeys = Object.keys(data);

  var ownProps = _objectSpread({}, this.props);

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

    return _objectSpread({}, _outterState, gettersState);
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
  return _objectSpread({}, outterState, gettersState);
}
function setStoreDataByState() {
  var storeData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return Object.keys(state).reduce(function (p, v) {
    p[v] = state[v];
    return p;
  }, storeData);
}function mapActionsToMethod(mappers, actions, target) {
  if (isArray(mappers)) {
    mappers.forEach(function (element) {
      // 强制不校验或校验但不通过
      if (actions === false || actions[element]) {
        target[element] = function (payload) {
          if (isObject(payload)) {
            wrapDataInstance(payload);
          }

          this.dispatch(element, payload);
        };
      }
    });
  } else if (isFunc(mappers)) {
    var result = mappers(this.dispatch, this);
    Object.assign(target, result);
  } else {
    Object.keys(mappers).forEach(function (element) {
      if (isFunc(methodName)) {
        target[element] = function (payload) {
          if (isObject(payload)) {
            wrapDataInstance(payload);
          }

          methodName.call(this, payload);
        };

        return;
      }

      var methodName = mappers[element];

      if (actions === false || actions[methodName]) {
        target[element] = function (e) {
          var payload = e;
          this.dispatch(methodName, payload);
        };
      }
    });
  }
}
function mapMutationsToMethod(mappers, target) {
  if (isArray(mappers)) {
    mappers.forEach(function (element) {
      target[element] = function (payload) {
        if (isObject(payload)) {
          wrapDataInstance(payload);
        }

        this.commit(element, payload);
      };
    });
  } else if (isFunc(mappers)) {
    var result = mappers(this.commit, this);
    Object.assign(target, result);
  } else {
    Object.keys(mappers).forEach(function (element) {
      var methodName = mappers[element];

      if (isFunc(methodName)) {
        target[element] = function (payload) {
          if (isObject(payload)) {
            wrapDataInstance(payload);
          }

          methodName.call(this, payload);
        };

        return;
      }

      target[element] = function (e) {
        var payload = e;
        this.commit(methodName, payload);
      };
    });
  }
}function getPath(link) {
  var number = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  return isString(link) && link.split('/')[number];
}

var defaultConfig = {
  data: {},
  props: {},
  methods: {}
};
function connect(options) {
  var _options$mapStateToPr = options.mapStateToProps,
      mapStateToProps = _options$mapStateToPr === void 0 ? [] : _options$mapStateToPr,
      _options$mapGettersTo = options.mapGettersToProps,
      mapGettersToProps = _options$mapGettersTo === void 0 ? [] : _options$mapGettersTo,
      _options$instanceName = options.instanceName,
      instanceName = _options$instanceName === void 0 ? '' : _options$instanceName,
      namespace = options.namespace,
      _options$data = options.data,
      data = _options$data === void 0 ? {} : _options$data,
      _options$props = options.props,
      props = _options$props === void 0 ? {} : _options$props;
  return function () {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultConfig;
    config.data = config.data || {};
    config.props = config.props || {};
    config.methods = config.methods || {};

    if (options.mapActionsToMethod) {
      mapActionsToMethod(options.mapActionsToMethod, false, config.methods);
    }

    if (options.methods) {
      mapMutationsToMethod(options.methods, config.methods);
    }

    if (options.mapMutationsToMethod) {
      mapMutationsToMethod(options.mapMutationsToMethod, config.methods);
    }

    var _didMount = config.didMount;
    var _didUnMount = config.didUnmount;
    var key = namespace || instanceName;
    Object.assign(config.data, data);
    Object.assign(config.props, props);
    return _objectSpread({}, config, {
      methods: _objectSpread({}, config.methods, createConnectHelpers.call(global, global, key, config)),
      didMount: function didMount() {
        var _this = this;

        var that = this; // 组件可以添加 $ref 来拿相应的实例

        var propsRef = this.props.$ref;
        var key = namespace || instanceName || global.getCurrentPath() || global.getCurrentViewId() || -1;
        var targetInstanceObj = global.getInstance(key);

        if (!targetInstanceObj && typeof _didMount === 'function') {
          console.warn('未绑定 store');

          _didMount.call(this);

          return;
        } // 当前component表达


        var componentIs = getPath(this.is, 2);
        var currentRoute = targetInstanceObj.store.getInstance().route;
        console.info("".concat(componentIs, " \u7EC4\u4EF6\u5DF2\u5173\u8054 ").concat(currentRoute, "_").concat(key, " \u7684 store"), targetInstanceObj);
        Object.assign(this, {
          storeConfig: targetInstanceObj.config,
          storeInstance: targetInstanceObj.store
        });
        this.$emitter = global.emitter;
        var store = targetInstanceObj.store;
        this.$store = store;
        var initialData = setDataByStateProps.call(that, mapStateToProps, store.getInstance().data, config, mapGettersToProps, store.getInstance());
        this.setData(initialData); // 自动注册进 components 实例, propsRef 开发者自己保证唯一性

        global.registerComponents(propsRef || "".concat(getPath(currentRoute), ":").concat(componentIs), this);

        if (mapStateToProps) {
          // store 触发的更新
          this.herculexUpdateLisitener = store.$emitter.addListener('updateState', function (_ref) {
            var _ref$state = _ref.state,
                state = _ref$state === void 0 ? {} : _ref$state;
            var nextData = setDataByStateProps.call(that, mapStateToProps, state, config, mapGettersToProps, store.getInstance(), true);
            var originBindViewId = _this.$page.$viewId || -1;
            var currentViewId = getCurrentPages().pop() ? getCurrentPages().pop().$viewId || -1 : -1;
            if (originBindViewId !== currentViewId) return;
            that.setData(nextData);
          });
        }

        if (typeof _didMount === 'function') {
          _didMount.call(this);
        }
      },
      didUnmount: function didUnmount() {
        this.herculexUpdateLisitener && this.herculexUpdateLisitener();

        if (typeof _didUnMount === 'function') {
          _didUnMount.call(this);
        }
      }
    });
  };
}function shouldImmutableDecorate(f) {
  if (f._shouldImmutable || f._shouldImmutable === false) {
    return;
  }

  var functionString = f.toString(); // 当 mutation 写了 return 语句，则自己保证其 immutable，建议就使用提供的 immutable-helper

  if (!/return /gm.test(functionString)) {
    f._shouldImmutable = true;
  }
}

function wrapMutation(config) {
  Object.values(config).forEach(function (func) {
    if (!config.mutationImmutableWrapper) {
      shouldImmutableDecorate(func);
    }
  });
}

function configPreHandler(config) {
  // 防空
  config.state = config.state || {};
  config.mutations = config.mutations || {};
  config.actions = config.actions || {}; // 给 mutaiton 包装是否需要 immer 操作

  if (config.mutations) {
    wrapMutation(config.mutations);
  }

  if (config.services) {
    var serviceRenameObj = Object.keys(config.services).reduce(function (p, v) {
      p["$service:".concat(v)] = config.services[v];
      return p;
    }, {});
    Object.assign(config.actions, serviceRenameObj);
  } // 给插件提供修改初始配置的能力


  if (config.plugins) {
    config.plugins = config.plugins.map(function (plugin) {
      if (isArray(plugin)) {
        if (isFunc(plugin[1])) {
          plugin[1](config);
        } else {
          Object.assign(config, plugin[1]);
        }

        return plugin[0];
      }

      return plugin;
    });
  }
}function getPath$1(link) {
  return link && link.split('/')[1];
} // 允许空


function GlobalStore() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  configPreHandler(config);
  global.setGlobalStoreConfig(config);
  return function (config) {
    var _onLoad = config.onLoad;

    config.onLoad = function (options) {
      global.emitter.emitEvent('updateCurrentPath', {
        currentPath: getPath$1(options.path),
        query: {}
      });

      _onLoad(options);
    };

    return config;
  };
}function defaultMixin (register) {
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
  mapMutationsToMethod(this.methods, config);
  return register(config);
}// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  console.log('add polyfill find');
  Object.defineProperty(Array.prototype, 'find', {
    value: function value(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

      var len = o.length >>> 0; // 3. If IsCallable(predicate) is false, throw a TypeError exception.

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      } // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.


      var thisArg = arguments[1]; // 5. Let k be 0.

      var k = 0; // 6. Repeat, while k < len

      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];

        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        } // e. Increase k by 1.


        k++;
      } // 7. Return undefined.


      return undefined;
    },
    configurable: true,
    writable: true
  });
}// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function value(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

      var len = o.length >>> 0; // 3. If IsCallable(predicate) is false, throw a TypeError exception.

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      } // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.


      var thisArg = arguments[1]; // 5. Let k be 0.

      var k = 0; // 6. Repeat, while k < len

      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];

        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        } // e. Increase k by 1.


        k++;
      } // 7. Return -1.


      return -1;
    },
    configurable: true,
    writable: true
  });
}// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  console.log('add polyfill includes');
  Object.defineProperty(Array.prototype, 'includes', {
    value: function value(searchElement, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      } // 1. Let O be ? ToObject(this value).


      var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

      var len = o.length >>> 0; // 3. If len is 0, return false.

      if (len === 0) {
        return false;
      } // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)


      var n = fromIndex | 0; // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.

      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
      } // 7. Repeat, while k < len


      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        } // c. Increase k by 1.


        k++;
      } // 8. Return false


      return false;
    }
  });
}if (!String.prototype.includes) {
  Object.defineProperty(String.prototype, 'includes', {
    value: function value(search, start) {
      if (typeof start !== 'number') {
        start = 0;
      }

      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    }
  });
}if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (search, pos) {
    return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  };
}function getPath$2(link) {
  return isString(link) && link.split('/')[1];
}

var Store =
/*#__PURE__*/
function () {
  function Store(store, options) {
    _classCallCheck(this, Store);

    this.$global = global;
    this.$emitter = new EventEmitter(); // 预处理配置转化

    configPreHandler(store);
    Object.assign(this, {
      connectGlobal: store.connectGlobal,
      mapGlobals: store.mapGlobals,
      actions: store.actions,
      methods: store.methods || {},
      mutations: store.mutations || {},
      plugins: store.plugins || [],
      getters: store.getters || {},
      instanceName: store.namespace || store.instanceName
    });
    this.stateConfig = mapGettersToState(store.state || {}, this.getters, this);
    this.stateConfig.$global = this.connectGlobal ? global.getGlobalState(this.mapGlobals) : {};
    this.subscribe = this.subscribe.bind(this);
    this.register = this.register.bind(this);
    this.subscribeAction = this.subscribeAction.bind(this);
    this.when = this.when.bind(this);
  }

  _createClass(Store, [{
    key: "getInstance",
    value: function getInstance() {
      return this.storeInstance;
    } // 实现 mobx when

  }, {
    key: "when",
    value: function when(predicate, effect) {
      var _this = this;

      var emitter = this.$emitter;
      if (!predicate) return Promise.reject();
      return new Promise(function (resolve) {
        var initialData = _this.storeInstance ? _this.storeInstance.data : {};

        if (predicate(initialData)) {
          if (effect) {
            effect.call(_this, initialData);
          }

          return resolve(initialData);
        }

        var lisitener = emitter.addListener('updateState', function (_ref) {
          var state = _ref.state,
              mutation = _ref.mutation,
              prevState = _ref.prevState;
          var newData = setStoreDataByState(_this.storeInstance.data, state);
          var currentPageInstance = getCurrentPages().pop() || {};
          var instanceView = _this.storeInstance.$viewId || -1;
          var currentView = currentPageInstance.$viewId || -1; // 已经不在当前页面的不再触发

          if (instanceView === currentView) {
            if (predicate(newData)) {
              if (effect) {
                effect.call(_this, newData);
              }

              resolve(newData);
              emitter.removeListener('updateState', lisitener);
            }
          }
        });
      });
    } // 实现 store.subscribe

  }, {
    key: "subscribe",
    value: function subscribe(subscriber, actionSubscriber) {
      var _this2 = this;

      var emitter = this.$emitter;
      var originViewInstance = getCurrentPages().pop() || {};

      if (subscriber) {
        this.storeUpdateLisitenerDispose = emitter.addListener('updateState', function (_ref2) {
          var state = _ref2.state,
              mutation = _ref2.mutation,
              prevState = _ref2.prevState;
          var currentPageInstance = getCurrentPages().pop() || {};
          var instanceView = originViewInstance.$viewId || -1;
          var currentView = currentPageInstance.$viewId || -1; // 已经不在当前页面的不再触发

          if (instanceView === currentView) {
            subscriber(mutation, wrapState(_objectSpread({}, _this2.storeInstance.data)), wrapState(_objectSpread({}, prevState)));
          }
        });
      }

      if (actionSubscriber) {
        this.storeDispatchActionLisitenerDispose = emitter.addListener('dispatchAction', function (action, next) {
          actionSubscriber(action, next);
        });
      }
    }
  }, {
    key: "subscribeAction",
    value: function subscribeAction(actionSubscriber) {
      var emitter = this.$emitter;
      var originViewInstance = getCurrentPages().pop() || {};

      if (actionSubscriber) {
        emitter.addListener('dispatchAction', function (action, next) {
          var currentPageInstance = getCurrentPages().pop() || {};
          var instanceView = originViewInstance.$viewId || -1;
          var currentView = currentPageInstance.$viewId || -1;

          if (instanceView === currentView) {
            return actionSubscriber(action, next);
          }
        });
      }
    }
  }, {
    key: "use",
    value: function use() {
      var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMixin;

      if (isFunc(option)) {
        return option.call(this, this.register, global);
      } else {
        return this.register(option);
      }
    }
  }, {
    key: "register",
    value: function register() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var that = this;
      config.data = config.data || {};
      Object.assign(config.data, this.stateConfig, config.state);

      var initialState = _objectSpread({}, config.data);

      var originOnLoad = config.onLoad;
      var originOnUnload = config.onUnload;
      var originOnShow = config.onShow;
      var originOnHide = config.onHide;
      var emitter = this.$emitter; // mappers

      if (config.mapActionsToMethod) {
        mapActionsToMethod(config.mapActionsToMethod, this.actions, config);
      }

      if (config.methods) {
        mapMutationsToMethod(config.methods, config);
      }

      if (config.mapMutationsToMethod) {
        mapMutationsToMethod(config.mapMutationsToMethod, config);
      }

      config.onHide = function () {
        var currentPageInstance = getCurrentPages().pop() || {};
        global.emitter.emitEvent('updateCurrentPath', {
          from: getPath$2(currentPageInstance.route),
          fromViewId: currentPageInstance.$viewId || -1
        });
        originOnHide && originOnHide.apply(this, arguments);
        this._isHided = true;
      };

      config.onUnload = function () {
        var currentPageInstance = getCurrentPages().pop() || {};
        global.emitter.emitEvent('updateCurrentPath', {
          from: getPath$2(currentPageInstance.route)
        });
        this.herculexUpdateLisitener && this.herculexUpdateLisitener();
        this.herculexUpdateLisitenerGlobal && this.herculexUpdateLisitenerGlobal();

        if (this.$store) {
          this.$store.storeUpdateLisitenerDispose && this.$store.storeUpdateLisitenerDispose();
          this.$store.storeDispatchActionLisitenerDispose && this.$store.storeDispatchActionLisitenerDispose();
        }

        originOnUnload && originOnUnload.apply(this, arguments);
      };

      config.onShow = function (d) {
        var currentPageInstance = getCurrentPages().pop() || {}; // 消费 Resume 字段

        var resumeData = global.messageManager.pop('$RESUME') || {};
        global.emitter.emitEvent('updateCurrentPath', Object.assign(currentPageInstance.$routeConfig || {}, {
          currentPath: getPath$2(currentPageInstance.route),
          context: resumeData
        })); // 如果有开全局，先触发

        if (that.connectGlobal) {
          // sync global data
          emitter.emitEvent('updateState', {
            state: _objectSpread({}, this.data, {
              $global: _objectSpread({}, this.data.$global, global.getGlobalState(this.mapGlobals))
            }),
            mutation: {
              type: 'sync_global_data'
            },
            prevState: this.data
          });
        }

        originOnShow && originOnShow.apply(this, arguments);

        if (this._isHided) {
          config.onResume && config.onResume.call(this, Object.assign({}, d, resumeData));
          this._isHided = false;
        }
      };

      config.onLoad = function (query) {
        var _this3 = this;

        var onloadInstance = this;
        this.$emitter = emitter;
        this.$globalEmitter = global.emitter;
        this.$message = global.messageManager;
        this.$store = that;
        this.$when = that.when; // 先榜上更新 store 的 监听器

        this.herculexUpdateLisitener = emitter.addListener('updateState', function (_ref3) {
          var state = _ref3.state;
          var newData = setStoreDataByState(_this3.data, state);
          var currentPageInstance = getCurrentPages().pop() || {};
          var instanceView = onloadInstance.$viewId || -1;
          var currentView = currentPageInstance.$viewId || -1; // 已经不在当前页面的不再触发

          if (instanceView === currentView) {
            _this3.setData(newData);
          }
        });

        if (that.connectGlobal) {
          // 立马触发同步
          emitter.emitEvent('updateState', {
            state: _objectSpread({}, this.data, {
              $global: _objectSpread({}, this.data.$global, global.getGlobalState(this.mapGlobals))
            }),
            mutation: {
              type: 'sync_global_data'
            },
            prevState: this.data
          }); // 增加nextprops的关联

          this.herculexUpdateLisitenerGlobal = global.emitter.addListener('updateGlobalStore', function () {
            var currentPageInstance = getCurrentPages().pop() || {};
            var instanceView = onloadInstance.$viewId || -1;
            var currentView = currentPageInstance.$viewId || -1; // 已经不在当前页面的不再触发

            if (instanceView !== currentView) return;
            emitter.emitEvent('updateState', {
              state: _objectSpread({}, _this3.data, {
                $global: _objectSpread({}, _this3.data.$global, global.getGlobalState(_this3.mapGlobals))
              }),
              mutation: {
                type: 'sync_global_data'
              },
              prevState: _this3.data
            });
          });
        }

        this.subscribe = that.subscribe;
        this.subscribeAction = that.subscribeAction; // 设置页面 path 和 query

        var currentPageInstance = getCurrentPages().pop() || {};
        var currentPath = getPath$2(currentPageInstance.route); // 外面携带的数据

        var contextData = global.messageManager.pop('$RESUME') || {};
        var viewId = currentPageInstance.$viewId || -1;
        this.$routeConfig = {
          currentPath: currentPath,
          query: query,
          context: contextData,
          viewId: viewId
        };
        global.emitter.emitEvent('updateCurrentPath', this.$routeConfig); // query.$context = loadData;

        that.storeInstance = this;
        var name = that.instanceName || currentPath || viewId || -1; // 把命名空间灌到实例

        this.instanceName = name;
        global.registerInstance(name, {
          config: {
            actions: that.actions,
            mutations: that.mutations,
            state: initialState
          },
          store: that,
          name: name,
          currentPath: currentPath,
          viewId: viewId
        });

        if (that.plugins) {
          that.plugins.forEach(function (element) {
            var pluginFunc = isString(element) ? _innerPlugins[element] : element;
            pluginFunc(that.storeInstance);
          });
        } // 绑定属性关系


        Object.defineProperty(this, 'state', {
          get: function get() {
            return wrapDataInstance(this.data);
          }
        });
        this.$getters = wrapDataInstance(this.state.$getters);
        this.$global = wrapDataInstance(_objectSpread({}, this.state.$global)); // 获取其他 store 的只读数据

        this.$getState = function (name) {
          if (!name) return this.state;
          return global.getState(name);
        };

        this.$getRef = function (name) {
          return global.getComponentRef(name);
        };

        if (originOnLoad) {
          originOnLoad.call(this, query, contextData);
        }
      };

      return _objectSpread({}, config, createHelpers.call(this, that.actions, that.mutations, that.$emitter));
    } // connect(options) {
    //   const { mapStateToProps = [], mapGettersToProps } = options;
    //   const that = this;
    //   return function (config) {
    //     const _didMount = config.didMount;
    //     Object.assign(that.mutations, config.mutations || {});
    //     return {
    //       ...config,
    //       methods: {
    //         ...config.methods,
    //         ...createConnectHelpers.call(this, that)
    //       },
    //       didMount() {
    //         const initialData = setDataByStateProps(mapStateToProps, that.getInstance().data, config, mapGettersToProps);
    //         this.setData(initialData);
    //         if (mapStateToProps) {
    //           that.$emitter.addListener('updateState', ({state = {}}) => {
    //             const nextData = setDataByStateProps(mapStateToProps, state, config, mapGettersToProps);
    //             this.setData(nextData);
    //           });
    //         }
    //         if (typeof _didMount === 'function') {
    //           _didMount.call(this);
    //         }
    //       }
    //     };
    //   };
    // }

  }]);

  return Store;
}();export default Store;export{connect,GlobalStore};