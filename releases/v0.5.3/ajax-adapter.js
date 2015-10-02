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

          request.setRequestHeader("Content-Type", "application/vnd.api+json");

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

          request.send(JSON.stringify({
            data: store.convert(type, partial)
          }));
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

          request.setRequestHeader("Content-Type", "application/vnd.api+json");

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

          request.setRequestHeader("Content-Type", "application/vnd.api+json");

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

          request.setRequestHeader("Content-Type", "application/vnd.api+json");

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

          request.send(JSON.stringify({
            data: data
          }));
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
