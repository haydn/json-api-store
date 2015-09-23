(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Store = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Array.prototype.find - MIT License (c) 2013 Paul Miller <http://paulmillr.com>
// For all details and docs: https://github.com/paulmillr/array.prototype.find
// Fixes and tests supplied by Duncan Hall <http://duncanhall.net> 
(function(globals){
  if (Array.prototype.find) return;

  var find = function(predicate) {
    var list = Object(this);
    var length = list.length < 0 ? 0 : list.length >>> 0; // ES.ToUint32;
    if (length === 0) return undefined;
    if (typeof predicate !== 'function' || Object.prototype.toString.call(predicate) !== '[object Function]') {
      throw new TypeError('Array#find: predicate must be a function');
    }
    var thisArg = arguments[1];
    for (var i = 0, value; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) return value;
    }
    return undefined;
  };

  if (Object.defineProperty) {
    try {
      Object.defineProperty(Array.prototype, 'find', {
        value: find, configurable: true, enumerable: false, writable: true
      });
    } catch(e) {}
  }

  if (!Array.prototype.find) {
    Array.prototype.find = find;
  }
})(this);

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var AjaxAdapter = (function () {
  function AjaxAdapter(options) {
    _classCallCheck(this, AjaxAdapter);

    this._base = options && options.base || "";
  }

  _createClass(AjaxAdapter, [{
    key: 'create',
    value: function create(store, type, partial, success, error, context) {
      var _this = this;

      if (error && ({}).toString.call(error) !== '[object Function]') {

        this.create(store, type, partial, success, null, error);
      } else if (store._types[type]) {
        (function () {

          var request = new XMLHttpRequest();

          request.open('POST', _this._base + '/' + type, true);

          request.onload = function () {
            if (request.status >= 200 && request.status < 300) {
              var response = JSON.parse(request.responseText);
              try {
                store.push(response);
                if (success) {
                  success.call(context, store.find(response.data.type, response.data.id));
                }
              } catch (e) {
                if (error) {
                  error.call(context, e);
                }
              }
            } else {
              if (error) {
                error.call(context);
              }
            }
          };

          request.send({
            data: JSON.stringify(store.convert(type, partial))
          });
        })();
      } else {
        throw new Error('Unknown type \'' + type + '\'');
      }
    }
  }, {
    key: 'destroy',
    value: function destroy(store, type, id, success, error, context) {
      var _this2 = this;

      if (error && ({}).toString.call(error) !== '[object Function]') {

        this.destroy(store, type, id, success, null, error);
      } else if (store._types[type]) {
        (function () {

          var request = new XMLHttpRequest();

          request.open('DELETE', _this2._base + '/' + type + '/' + id, true);

          request.onload = function () {
            if (request.status >= 200 && request.status < 300) {
              try {
                store.remove(type, id);
                if (success) {
                  success.call(context);
                }
              } catch (e) {
                error.call(context, e);
              }
            } else if (error) {
              error.call(context);
            }
          };

          request.send();
        })();
      } else {
        throw new Error('Unknown type \'' + type + '\'');
      }
    }
  }, {
    key: 'load',
    value: function load(store, type, id, options, success, error, context) {
      var _this3 = this;

      if (id && ({}).toString.call(id) === '[object Function]') {
        this.load(store, type, null, null, id, options, success);
      } else if (id && typeof id === "object") {
        this.load(store, type, null, id, options, success, error);
      } else if (options && ({}).toString.call(options) === '[object Function]') {
        this.load(store, type, id, {}, options, success, error);
      } else if (error && ({}).toString.call(error) !== '[object Function]') {
        this.load(store, type, id, options, success, null, error);
      } else if (store._types[type]) {
        (function () {

          var request = new XMLHttpRequest();
          var url = undefined;

          options = options || {};
          url = id ? _this3._base + '/' + type + '/' + id : _this3._base + '/' + type;

          if (options) {

            var params = [];

            if (options.fields) {
              Object.keys(options.fields).forEach(function (field) {
                options['fields[' + field + ']'] = options.fields[field];
              });
              delete options.fields;
            }

            params = Object.keys(options).map(function (key) {
              return key + "=" + encodeURIComponent(options[key]);
            }).sort();

            if (params.length) {
              url = url + '?' + params.join("&");
            }
          }

          request.open('GET', url, true);

          request.onload = function () {
            if (request.status >= 200 && request.status < 300) {
              try {
                store.push(JSON.parse(request.responseText));
                if (success) {
                  success.call(context, id ? store.find(type, id) : store.find(type));
                }
              } catch (e) {
                error.call({}, e);
              }
            } else if (error) {
              error.call(context);
            }
          };

          request.send();
        })();
      } else {
        throw new Error('Unknown type \'' + type + '\'');
      }
    }
  }, {
    key: 'update',
    value: function update(store, type, id, partial, success, error, context) {
      var _this4 = this;

      if (error && ({}).toString.call(error) !== '[object Function]') {

        this.update(store, type, id, partial, success, null, error);
      } else if (store._types[type]) {
        (function () {

          var request = new XMLHttpRequest();
          var data = store.convert(type, id, partial);

          request.open('PATCH', _this4._base + '/' + type + '/' + id, true);

          request.onload = function () {
            if (request.status >= 200 && request.status < 300) {
              try {
                store.add(data);
                if (success) {
                  success.call(context, store.find(data.type, data.id));
                }
              } catch (e) {
                if (error) {
                  error.call(context, e);
                }
              }
            } else if (error) {
              error.call(context);
            }
          };

          request.send({
            data: JSON.stringify(data)
          });
        })();
      } else {
        throw new Error('Unknown type \'' + type + '\'');
      }
    }
  }]);

  return AjaxAdapter;
})();

exports['default'] = AjaxAdapter;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("array.prototype.find");

var _ajaxAdapter = require("./ajax-adapter");

var _ajaxAdapter2 = _interopRequireDefault(_ajaxAdapter);

var Store = (function () {
  _createClass(Store, null, [{
    key: "attr",

    /**
     * Creates a field definition for an attribute.
     *
     * @since 0.1.0
     * @param {string} [name] - Name of the property to map this field from.
     * @param {Object} [options] - An options object.
     * @param {string} [options.default] - Default value for this field.
     * @return {Object} - Field definition.
     */
    value: function attr(name, options) {
      if (name && typeof name === 'object') {
        return Store.attr(null, name);
      } else {
        return {
          type: "attr",
          "default": options && options["default"],
          deserialize: function deserialize(data, key) {
            return data.attributes && data.attributes[name || key];
          },
          serialize: function serialize(resource, data, key) {
            data.attributes[name || key] = resource[key];
          }
        };
      }
    }

    /**
     * Creates a field definition for an has-one relationship.
     *
     * @since 0.1.0
     * @param {string} [name] - Name of the property to map this field from.
     * @param {Object} [options] - An options object.
     * @param {string} [options.inverse] - Name of the inverse relationship.
     * @return {Object} - Field definition.
     */
  }, {
    key: "hasOne",
    value: function hasOne(name, options) {
      if (name && typeof name === 'object') {
        return Store.hasOne(null, name);
      } else {
        return {
          type: "has-one",
          inverse: options && options.inverse,
          deserialize: function deserialize(data, key) {
            name = name || key;
            if (data.relationships && data.relationships[name]) {
              if (data.relationships[name].data === null) {
                return null;
              } else if (data.relationships[name].data) {
                return this.find(data.relationships[name].data.type, data.relationships[name].data.id);
              }
            }
          }
        };
      }
    }

    /**
     * Creates a field definition for an has-many relationship.
     *
     * @since 0.1.0
     * @param {string} [name] - Name of the property to map this field from.
     * @param {Object} [options] - An options object.
     * @param {string} [options.inverse] - Name of the inverse relationship.
     * @return {Object} - Field definition.
     */
  }, {
    key: "hasMany",
    value: function hasMany(name, options) {
      if (name && typeof name === 'object') {
        return Store.hasMany(null, name);
      } else {
        return {
          type: "has-many",
          "default": [],
          inverse: options && options.inverse,
          deserialize: function deserialize(data, key) {
            var _this = this;

            name = name || key;
            if (data.relationships && data.relationships[name]) {
              if (data.relationships[name].data === null) {
                return [];
              } else if (data.relationships[name].data) {
                return data.relationships[name].data.map(function (c) {
                  return _this.find(c.type, c.id);
                });
              }
            }
          }
        };
      }
    }
  }]);

  function Store(adapter) {
    _classCallCheck(this, Store);

    this._adapter = adapter;
    this._collectionListeners = { "added": {}, "updated": {}, "removed": {} };
    this._data = {};
    this._resourceListeners = { "added": {}, "updated": {}, "removed": {} };
    this._types = {};
  }

  /**
   * Add an individual resource to the store. This is used internally by the
   * `push()` method.
   *
   * @since 0.1.0
   * @param {!Object} object - Resource Object to add. See:
            http://jsonapi.org/format/#document-resource-objects
   * @return {undefined} - Nothing.
   */

  _createClass(Store, [{
    key: "add",
    value: function add(object) {
      var _this2 = this;

      if (object) {
        if (object.type && object.id) {
          (function () {
            var event = _this2._data[object.type] && _this2._data[object.type][object.id] ? "updated" : "added";
            var resource = _this2.find(object.type, object.id);
            var definition = _this2._types[object.type];
            Object.keys(definition).forEach(function (fieldName) {
              if (fieldName[0] !== "_") {
                _this2._addField(object, resource, definition, fieldName);
              }
            });
            if (_this2._resourceListeners[event][object.type] && _this2._resourceListeners[event][object.type][object.id]) {
              _this2._resourceListeners[event][object.type][object.id].forEach(function (x) {
                return x[0].call(x[1], resource);
              });
            }
            if (_this2._collectionListeners[event][object.type]) {
              _this2._collectionListeners[event][object.type].forEach(function (x) {
                return x[0].call(x[1], resource);
              });
            }
          })();
        } else {
          throw new TypeError("The data must have a type and id");
        }
      } else {
        throw new TypeError("You must provide data to add");
      }
    }

    /**
     * Converts the given partial into a JSON API compliant representation.
     *
     * @since 0.5.0
     * @param {!string} [type] - The type of the resource. This can be omitted if the partial includes a type property.
     * @param {!string} [id] - The id of the resource. This can be omitted if the partial includes an id property.
     * @param {!object} partial - The data to convert.
     * @return {object} - JSON API version of the object.
     */
  }, {
    key: "convert",
    value: function convert(type, id, partial) {
      var _this3 = this;

      if (type && typeof type === "object") {
        return this.convert(type.type, type.id, type);
      } else if (id && typeof id === "object") {
        return this.convert(type, id.id, id);
      } else {
        var _ret2 = (function () {
          var data = {
            type: type,
            attributes: {},
            relationships: {}
          };
          if (id) {
            data.id = id;
          }
          var definition = _this3._types[data.type];
          Object.keys(definition).forEach(function (fieldName) {
            if (fieldName[0] !== "_") {
              definition[fieldName].serialize(partial, data, fieldName);
            }
          });
          return {
            v: data
          };
        })();

        if (typeof _ret2 === "object") return _ret2.v;
      }
    }

    /**
     * Attempts to create the resource through the adapter and adds it to  the
     * store if successful.
     *
     * @since 0.5.0
     * @param {!string} type - Type of resource.
     * @param {!Object} partial - Data to create the resource with.
     * @param {function} [success] - Callback on success.
     * @param {function} [error] - Callback on error.
     * @param {Object} [context] - Context for the callbacks.
     * @return {undefined} - Nothing.
     *
     * @example
     * let adapter = new Store.AjaxAdapter();
     * let store = new Store(adpater);
     * store.create("product", { title: "A Book" }, (product) => {
     *   console.log(product.title);
     * });
     */
  }, {
    key: "create",
    value: function create(type, partial, success, error, context) {
      if (this._adapter) {
        this._adapter.create(this, type, partial, success, error, context);
      } else {
        throw new Error("Adapter missing. Specify an adapter when creating the store: `var store = new Store(adapter);`");
      }
    }

    /**
     * Defines a type of resource.
     *
     * @since 0.2.0
     * @param {!string|string[]} names - Name(s) of the resource.
     * @param {!Object} definition - The resource's definition.
     * @return {undefined} - Nothing.
     */
  }, {
    key: "define",
    value: function define(names, definition) {
      var _this4 = this;

      names = names.constructor === Array ? names : [names];
      if (definition) {
        definition._names = names;
        names.forEach(function (name) {
          if (!_this4._types[name]) {
            _this4._types[name] = definition;
          } else {
            throw new Error("The type '" + name + "' has already been defined.");
          }
        });
      } else {
        throw new Error("You must provide a definition for the type '" + names[0] + "'.");
      }
    }

    /**
     * Attempts to delete the resource through the adapter and removes it from
     * the store if successful.
     *
     * @since 0.5.0
     * @param {!string} type - Type of resource.
     * @param {!string} id - ID of resource.
     * @param {function} [success] - Callback on success.
     * @param {function} [error] - Callback on error.
     * @param {Object} [context] - Context for the callbacks.
     * @return {undefined} - Nothing.
     *
     * @example
     * let adapter = new Store.AjaxAdapter();
     * let store = new Store(adpater);
     * store.destroy("product", "1", () => {
     *   console.log("Destroyed!");
     * });
     */
  }, {
    key: "destroy",
    value: function destroy(type, id, success, error, context) {
      if (this._adapter) {
        this._adapter.destroy(this, type, id, success, error, context);
      } else {
        throw new Error("Adapter missing. Specify an adapter when creating the store: `var store = new Store(adapter);`");
      }
    }

    /**
     * Find a resource or entire collection of resources.
     *
     * NOTE: If the resource hasn't been loaded via an add() or push() call it
     * will be automatically created when find is called.
     *
     * @since 0.1.0
     * @param {!string} type - Type of the resource(s) to find.
     * @param {string} [id] - The id of the resource to find. If omitted all
     *                        resources of the type will be returned.
     * @return {Object|Object[]} - Either the resource or an array of resources.
     */
  }, {
    key: "find",
    value: function find(type, id) {
      var _this5 = this;

      if (type) {
        var _ret3 = (function () {
          var definition = _this5._types[type];
          if (definition) {
            if (!_this5._data[type]) {
              (function () {
                var collection = {};
                definition._names.forEach(function (t) {
                  return _this5._data[t] = collection;
                });
              })();
            }
            if (id) {
              if (!_this5._data[type][id]) {
                _this5._data[type][id] = {
                  _dependents: [],
                  type: type,
                  id: id
                };
                Object.keys(definition).forEach(function (key) {
                  if (key[0] !== "_") {
                    _this5._data[type][id][key] = definition[key]["default"];
                  }
                });
              }
              return {
                v: _this5._data[type][id]
              };
            } else {
              return {
                v: Object.keys(_this5._data[type]).map(function (x) {
                  return _this5._data[type][x];
                })
              };
            }
          } else {
            throw new TypeError("Unknown type '" + type + "'");
          }
        })();

        if (typeof _ret3 === "object") return _ret3.v;
      } else {
        throw new TypeError("You must provide a type");
      }
    }

    /**
     * Attempts to load the resource(s) through the adapter and adds it/them to
     * the store if successful.
     *
     * @since 0.5.0
     * @param {!string} type - Type of resource.
     * @param {!string} [id] - ID of resource.
     * @param {Object} [options] - **NOT YET IMPLEMENTED** (this will include sorting, filtering and pagination options)
     * @param {function} [success] - Callback on success.
     * @param {function} [error] - Callback on error.
     * @param {Object} [context] - Context for the callbacks.
     * @return {undefined} - Nothing.
     *
     * @example
     * let adapter = new Store.AjaxAdapter();
     * let store = new Store(adpater);
     * store.load("product", "1", (product) => {
     *   console.log(product.title);
     * });
     */
  }, {
    key: "load",
    value: function load(type, id, options, success, error, context) {
      if (this._adapter) {
        this._adapter.load(this, type, id, options, success, error, context);
      } else {
        throw new Error("Adapter missing. Specify an adapter when creating the store: `var store = new Store(adapter);`");
      }
    }

    /**
     * Unregister an event listener that was registered with on().
     *
     * @since 0.4.0
     * @param {string} event - Name of the event.
     * @param {string} type - Name of resource to originally passed to on().
     * @param {string} [id] - ID of the resource to originally passed to on().
     * @param {function} callback - Function originally passed to on().
     * @return {undefined} - Nothing.
     */
  }, {
    key: "off",
    value: function off(event, type, id, callback) {
      var _this6 = this;

      if (this._resourceListeners[event] && this._collectionListeners[event]) {
        if (this._types[type]) {
          if (id && ({}).toString.call(id) === '[object Function]') {
            this.off.call(this, event, type, null, id, callback);
          } else {
            // TODO: Performance-wise, this can be made way better. There shouldn't be a need to maintain separate lists.
            this._types[type]._names.forEach(function (type) {
              if (id) {
                if (_this6._resourceListeners[event][type] && _this6._resourceListeners[event][type][id]) {
                  _this6._resourceListeners[event][type][id] = _this6._resourceListeners[event][type][id].filter(function (x) {
                    return x[0] !== callback;
                  });
                }
              } else if (_this6._collectionListeners[event][type]) {
                _this6._collectionListeners[event][type] = _this6._collectionListeners[event][type].filter(function (x) {
                  return x[0] !== callback;
                });
              }
            });
          }
        } else {
          throw new Error("Unknown type '" + type + "'");
        }
      } else {
        throw new Error("Unknown event '" + event + "'");
      }
    }

    /**
     * Register an event listener: "added", "updated" or "removed".
     *
     * @since 0.4.0
     * @param {string} event - Name of the event.
     * @param {string} type - Name of resource to watch.
     * @param {string} [id] - ID of the resource to watch.
     * @param {function} callback - Function to call when the event occurs.
     * @param {Object} [context] - Context in which to call the callback.
     * @return {undefined} - Nothing.
     */
  }, {
    key: "on",
    value: function on(event, type, id, callback, context) {
      var _this7 = this;

      if (this._resourceListeners[event] && this._collectionListeners[event]) {
        if (this._types[type]) {
          if (id && ({}).toString.call(id) === '[object Function]') {
            this.on.call(this, event, type, null, id, callback);
          } else {
            // TODO: Performance-wise, this can be made way better. There shouldn't be a need to maintain separate lists.
            this._types[type]._names.forEach(function (type) {
              if (id) {
                _this7._resourceListeners[event][type] = _this7._resourceListeners[event][type] || {};
                _this7._resourceListeners[event][type][id] = _this7._resourceListeners[event][type][id] || [];
                if (!_this7._resourceListeners[event][type][id].find(function (x) {
                  return x[0] === callback;
                })) {
                  _this7._resourceListeners[event][type][id].push([callback, context]);
                }
              } else {
                _this7._collectionListeners[event][type] = _this7._collectionListeners[event][type] || [];
                if (!_this7._collectionListeners[event][type].find(function (x) {
                  return x[0] === callback;
                })) {
                  _this7._collectionListeners[event][type].push([callback, context]);
                }
              }
            });
          }
        } else {
          throw new Error("Unknown type '" + type + "'");
        }
      } else {
        throw new Error("Unknown event '" + event + "'");
      }
    }

    /**
     * Add a JSON API response to the store. This method can be used to handle a
     * successful GET or POST response from the server.
     *
     * @since 0.1.0
     * @param {Object} root - Top Level Object to push. See:
                              http://jsonapi.org/format/#document-top-level
     * @return {undefined} - Nothing.
     */
  }, {
    key: "push",
    value: function push(root) {
      var _this8 = this;

      if (root.data.constructor === Array) {
        root.data.forEach(function (x) {
          return _this8.add(x);
        });
      } else {
        this.add(root.data);
      }
      if (root.included) {
        root.included.forEach(function (x) {
          return _this8.add(x);
        });
      }
    }

    /**
     * Remove a resource or collection of resources from the store.
     *
     * @since 0.1.0
     * @param {!string} type - Type of the resource(s) to remove.
     * @param {string} [id] - The id of the resource to remove. If omitted all
     *                        resources of the type will be removed.
     * @return {undefined} - Nothing.
     */
  }, {
    key: "remove",
    value: function remove(type, id) {
      var _this9 = this;

      if (type) {
        if (this._types[type]) {
          if (id) {
            (function () {
              var resource = _this9._data[type] && _this9._data[type][id];
              if (resource) {
                _this9._remove(resource);
                if (_this9._resourceListeners["removed"][type] && _this9._resourceListeners["removed"][type][id]) {
                  _this9._resourceListeners["removed"][type][id].forEach(function (x) {
                    return x[0].call(x[1], resource);
                  });
                }
                if (_this9._collectionListeners["removed"][type]) {
                  _this9._collectionListeners["removed"][type].forEach(function (x) {
                    return x[0].call(x[1], resource);
                  });
                }
              }
            })();
          } else {
            Object.keys(this._data[type]).forEach(function (id) {
              return _this9.remove(type, id);
            });
          }
        } else {
          throw new TypeError("Unknown type '" + type + "'");
        }
      } else {
        throw new TypeError("You must provide a type to remove");
      }
    }

    /**
     * Attempts to update the resource through the adapter and updates it in  the
     * store if successful.
     *
     * @since 0.5.0
     * @param {!string} type - Type of resource.
     * @param {!string} id - ID of resource.
     * @param {!Object} partial - Data to update the resource with.
     * @param {function} [success] - Callback on success.
     * @param {function} [error] - Callback on error.
     * @param {Object} [context] - Context for the callbacks.
     * @return {undefined} - Nothing.
     *
     * @example
     * let adapter = new Store.AjaxAdapter();
     * let store = new Store(adpater);
     * store.update("product", "1", { title: "foo" }, (product) => {
     *   console.log(product.title);
     * });
     */
  }, {
    key: "update",
    value: function update(type, id, partial, success, error, context) {
      if (this._adapter) {
        this._adapter.update(this, type, id, partial, success, error, context);
      } else {
        throw new Error("Adapter missing. Specify an adapter when creating the store: `var store = new Store(adapter);`");
      }
    }
  }, {
    key: "_addField",
    value: function _addField(object, resource, definition, fieldName) {
      var _this10 = this;

      var field = definition[fieldName];
      var newValue = field.deserialize.call(this, object, fieldName);
      if (typeof newValue !== "undefined") {
        if (field.type === "has-one") {
          if (resource[fieldName]) {
            this._removeInverseRelationship(resource, fieldName, resource[fieldName], field);
          }
          if (newValue) {
            this._addInverseRelationship(resource, fieldName, newValue, field);
          }
        } else if (field.type === "has-many") {
          resource[fieldName].forEach(function (r) {
            if (resource[fieldName].indexOf(r) !== -1) {
              _this10._removeInverseRelationship(resource, fieldName, r, field);
            }
          });
          newValue.forEach(function (r) {
            _this10._addInverseRelationship(resource, fieldName, r, field);
          });
        }
        resource[fieldName] = newValue;
      }
    }
  }, {
    key: "_addInverseRelationship",
    value: function _addInverseRelationship(sourceResource, sourceFieldName, targetResource, sourceField) {
      var targetDefinition = this._types[targetResource.type];
      var sourceDefinition = this._types[sourceResource.type];
      if (targetDefinition) {
        var targetFieldName = [sourceField.inverse].concat(sourceDefinition._names).find(function (x) {
          return targetDefinition[x];
        });
        var targetField = targetDefinition && targetDefinition[targetFieldName];
        targetResource._dependents.push({ type: sourceResource.type, id: sourceResource.id, fieldName: sourceFieldName });
        if (targetField) {
          if (targetField.type === "has-one") {
            sourceResource._dependents.push({ type: targetResource.type, id: targetResource.id, fieldName: targetFieldName });
            targetResource[targetFieldName] = sourceResource;
          } else if (targetField.type === "has-many") {
            sourceResource._dependents.push({ type: targetResource.type, id: targetResource.id, fieldName: targetFieldName });
            if (targetResource[targetFieldName].indexOf(sourceResource) === -1) {
              targetResource[targetFieldName].push(sourceResource);
            }
          } else if (targetField.type === "attr") {
            throw new Error("The the inverse relationship for '" + sourceFieldName + "' is an attribute ('" + targetFieldName + "')");
          }
        } else if (sourceField.inverse) {
          throw new Error("The the inverse relationship for '" + sourceFieldName + "' is missing ('" + sourceField.inverse + "')");
        }
      }
    }
  }, {
    key: "_remove",
    value: function _remove(resource) {
      var _this11 = this;

      resource._dependents.forEach(function (dependent) {
        var dependentResource = _this11._data[dependent.type][dependent.id];
        switch (_this11._types[dependent.type][dependent.fieldName].type) {
          case "has-one":
            {
              dependentResource[dependent.fieldName] = null;
              break;
            }
          case "has-many":
            {
              var index = dependentResource[dependent.fieldName].indexOf(resource);
              if (index !== -1) {
                dependentResource[dependent.fieldName].splice(index, 1);
              }
              break;
            }
          default:
            {
              break;
            }
        }
        // TODO: This only needs to be run once for each dependent.
        dependentResource._dependents = dependentResource._dependents.filter(function (d) {
          return !(d.type === resource.type && d.id === resource.id);
        });
      });
      delete this._data[resource.type][resource.id];
    }
  }, {
    key: "_removeInverseRelationship",
    value: function _removeInverseRelationship(sourceResource, sourceFieldName, targetResource, sourceField) {
      var targetDefinition = this._types[targetResource.type];
      var targetFieldName = sourceField.inverse || sourceResource.type;
      var targetField = targetDefinition && targetDefinition[targetFieldName];
      targetResource._dependents = targetResource._dependents.filter(function (r) {
        return !(r.type === sourceResource.type && r.id === sourceResource.id && r.fieldName === sourceFieldName);
      });
      if (targetField) {
        if (targetField.type === "has-one") {
          sourceResource._dependents = sourceResource._dependents.filter(function (r) {
            return !(r.type === targetResource.type && r.id === targetResource.id && r.fieldName === targetFieldName);
          });
          targetResource[targetFieldName] = null;
        } else if (targetField.type === "has-many") {
          sourceResource._dependents = sourceResource._dependents.filter(function (r) {
            return !(r.type === targetResource.type && r.id === targetResource.id && r.fieldName === targetFieldName);
          });
          targetResource[targetFieldName] = targetResource[targetFieldName].filter(function (r) {
            return r !== sourceResource;
          });
        } else if (targetField.type === "attr") {
          throw new Error("The the inverse relationship for '" + sourceFieldName + "' is an attribute ('" + targetFieldName + "')");
        }
      } else if (sourceField.inverse) {
        throw new Error("The the inverse relationship for '" + sourceFieldName + "' is missing ('" + sourceField.inverse + "')");
      }
    }
  }]);

  return Store;
})();

exports["default"] = Store;

Store.AjaxAdapter = _ajaxAdapter2["default"];
module.exports = exports["default"];

},{"./ajax-adapter":2,"array.prototype.find":1}]},{},[3])(3)
});
//# sourceMappingURL=store.dev.js.map
