"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ajax = require("./ajax");

var _ajax2 = _interopRequireDefault(_ajax);

var AjaxAdapter = (function () {
  function AjaxAdapter(options) {
    _classCallCheck(this, AjaxAdapter);

    this._base = options && options.base || "";
  }

  _createClass(AjaxAdapter, [{
    key: "create",
    value: function create(store, type, partial, options) {

      if (!store._types[type]) {
        throw new Error("Unknown type '" + type + "'");
      }

      var source = (0, _ajax2["default"])({
        body: JSON.stringify({
          data: store.convert(type, partial)
        }),
        crossDomain: true,
        headers: {
          "Content-Type": "application/vnd.api+json"
        },
        method: "POST",
        responseType: "auto",
        url: this._getUrl(type, null, options)
      })["do"](function (e) {
        return store.push(e.response);
      }).map(function (e) {
        return store.find(e.response.data.type, e.response.data.id);
      }).publish();

      source.connect();

      return source;
    }
  }, {
    key: "destroy",
    value: function destroy(store, type, id, options) {

      if (!store._types[type]) {
        throw new Error("Unknown type '" + type + "'");
      }

      var source = (0, _ajax2["default"])({
        crossDomain: true,
        headers: {
          "Content-Type": "application/vnd.api+json"
        },
        method: "DELETE",
        responseType: "auto",
        url: this._getUrl(type, id, options)
      })["do"](function () {
        return store.remove(type, id);
      }).publish();

      source.connect();

      return source;
    }
  }, {
    key: "load",
    value: function load(store, type, id, options) {

      if (id && typeof id === "object") {
        return this.load(store, type, null, id);
      }

      if (!store._types[type]) {
        throw new Error("Unknown type '" + type + "'");
      }

      var source = (0, _ajax2["default"])({
        crossDomain: true,
        headers: {
          "Content-Type": "application/vnd.api+json"
        },
        method: "GET",
        responseType: "auto",
        url: this._getUrl(type, id, options)
      })["do"](function (e) {
        return store.push(e.response);
      }).map(function () {
        return id ? store.find(type, id) : store.findAll(type);
      }).publish();

      source.connect();

      return source;
    }
  }, {
    key: "update",
    value: function update(store, type, id, partial, options) {

      if (!store._types[type]) {
        throw new Error("Unknown type '" + type + "'");
      }

      var data = store.convert(type, id, partial);

      var source = (0, _ajax2["default"])({
        body: JSON.stringify({
          data: data
        }),
        crossDomain: true,
        headers: {
          "Content-Type": "application/vnd.api+json"
        },
        method: "PATCH",
        responseType: "auto",
        url: this._getUrl(type, id, options)
      })["do"](function () {
        return store.add(data);
      }).map(function () {
        return store.find(type, id);
      }).publish();

      source.connect();

      return source;
    }
  }, {
    key: "_getUrl",
    value: function _getUrl(type, id, options) {

      var params = [];
      var url = id ? this._base + "/" + type + "/" + id : this._base + "/" + type;

      if (options) {

        if (options.fields) {
          Object.keys(options.fields).forEach(function (field) {
            options["fields[" + field + "]"] = options.fields[field];
          });
          delete options.fields;
        }

        params = Object.keys(options).map(function (key) {
          return key + "=" + encodeURIComponent(options[key]);
        }).sort();

        if (params.length) {
          url = url + "?" + params.join("&");
        }
      }

      return url;
    }
  }]);

  return AjaxAdapter;
})();

exports["default"] = AjaxAdapter;
module.exports = exports["default"];
