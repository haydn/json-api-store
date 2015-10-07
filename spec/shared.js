if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // native functions don't have a prototype
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}

import "./store/clud/create-spec";
import "./store/clud/destroy-spec";
import "./store/clud/load-all-spec";
import "./store/clud/load-spec";
import "./store/clud/update-spec";
import "./store/core/add-spec";
import "./store/core/convert-spec";
import "./store/core/define-spec";
import "./store/core/find-spec";
import "./store/core/find-all-spec";
import "./store/core/push-spec";
import "./store/core/remove-spec";
import "./store/events/observable-spec";
import "./store/events/off-spec";
import "./store/events/on-spec";
import "./store/fields/attr-spec";
import "./store/fields/has-many-spec";
import "./store/fields/has-one-spec";
