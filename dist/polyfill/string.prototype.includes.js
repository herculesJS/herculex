'use strict';

if (!String.prototype.includes) {
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
}