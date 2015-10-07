"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _rx = require("rx");

var _rx2 = _interopRequireDefault(_rx);

/**
 *
 * Derived from RxJS-DOM, Copyright (c) Microsoft Open Technologies, Inc:
 *
 * https://github.com/Reactive-Extensions/RxJS-DOM
 *
 * The original source file can be viewed here:
 *
 * https://github.com/Reactive-Extensions/RxJS-DOM/blob/fdb169c8bd1612318d530e6e54074b1c9e537906/src/ajax.js
 *
 * Licensed under the Apache License, Version 2.0:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Modifications from original:
 *
 * - extracted from "Rx.DOM" namespace
 * - minor eslinter cleanup ("var" to "let" etc)
 * - addition of "auto" responseType
 *
 */

var root = typeof window !== "undefined" && window || undefined;

// Gets the proper XMLHttpRequest for support for older IE
function getXMLHttpRequest() {
  if (root.XMLHttpRequest) {
    return new root.XMLHttpRequest();
  } else {
    var progId = undefined;
    try {
      var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
      for (var i = 0; i < 3; i++) {
        try {
          progId = progIds[i];
          if (new root.ActiveXObject(progId)) {
            break;
          }
        } catch (e) {}
      }
      return new root.ActiveXObject(progId);
    } catch (e) {
      throw new Error('XMLHttpRequest is not supported by your browser');
    }
  }
}

// Get CORS support even for older IE
function getCORSRequest() {
  var xhr = new root.XMLHttpRequest();
  if ('withCredentials' in xhr) {
    return xhr;
  } else if (!!root.XDomainRequest) {
    return new XDomainRequest();
  } else {
    throw new Error('CORS is not supported by your browser');
  }
}

function normalizeAjaxSuccessEvent(e, xhr, settings) {
  var response = 'response' in xhr ? xhr.response : xhr.responseText;
  if (settings.responseType === 'auto') {
    try {
      response = JSON.parse(response);
    } catch (e) {}
  } else {
    response = settings.responseType === 'json' ? JSON.parse(response) : response;
  }
  return {
    response: response,
    status: xhr.status,
    responseType: xhr.responseType,
    xhr: xhr,
    originalEvent: e
  };
}

function normalizeAjaxErrorEvent(e, xhr, type) {
  return {
    type: type,
    status: xhr.status,
    xhr: xhr,
    originalEvent: e
  };
}

/**
 * Creates an observable for an Ajax request with either a settings object with url, headers, etc or a string for a URL.
 *
 * @example
 *   source = ajax('/products');
 *   source = ajax({ url: 'products', method: 'GET' });
 *
 * @param {Object} settings Can be one of the following:
 *
 *  A string of the URL to make the Ajax call.
 *  An object with the following properties
 *   - url: URL of the request
 *   - body: The body of the request
 *   - method: Method of the request, such as GET, POST, PUT, PATCH, DELETE
 *   - async: Whether the request is async
 *   - headers: Optional headers
 *   - crossDomain: true if a cross domain request, else false
 *   - responseType: "text" (default), "json" or "auto"
 *
 * @returns {Observable} An observable sequence containing the XMLHttpRequest.
*/

exports["default"] = function (options) {
  var settings = {
    method: 'GET',
    crossDomain: false,
    async: true,
    headers: {},
    responseType: 'text',
    createXHR: function createXHR() {
      return this.crossDomain ? getCORSRequest() : getXMLHttpRequest();
    },
    normalizeError: normalizeAjaxErrorEvent,
    normalizeSuccess: normalizeAjaxSuccessEvent
  };

  if (typeof options === 'string') {
    settings.url = options;
  } else {
    for (var prop in options) {
      if (hasOwnProperty.call(options, prop)) {
        settings[prop] = options[prop];
      }
    }
  }

  var normalizeError = settings.normalizeError;
  var normalizeSuccess = settings.normalizeSuccess;

  if (!settings.crossDomain && !settings.headers['X-Requested-With']) {
    settings.headers['X-Requested-With'] = 'XMLHttpRequest';
  }
  settings.hasContent = settings.body !== undefined;

  return new _rx2["default"].AnonymousObservable(function (observer) {
    var isDone = false;
    var xhr;

    var processResponse = function processResponse(xhr, e) {
      var status = xhr.status === 1223 ? 204 : xhr.status;
      if (status >= 200 && status <= 300 || status === 0 || status === '') {
        observer.onNext(normalizeSuccess(e, xhr, settings));
        observer.onCompleted();
      } else {
        observer.onError(normalizeError(e, xhr, 'error'));
      }
      isDone = true;
    };

    try {
      xhr = settings.createXHR();;
    } catch (err) {
      observer.onError(err);
    }

    try {
      if (settings.user) {
        xhr.open(settings.method, settings.url, settings.async, settings.user, settings.password);
      } else {
        xhr.open(settings.method, settings.url, settings.async);
      }

      var headers = settings.headers;
      for (var header in headers) {
        if (hasOwnProperty.call(headers, header)) {
          xhr.setRequestHeader(header, headers[header]);
        }
      }

      if (!!xhr.upload || !('withCredentials' in xhr) && !!root.XDomainRequest) {
        xhr.onload = function (e) {
          if (settings.progressObserver) {
            settings.progressObserver.onNext(e);
            settings.progressObserver.onCompleted();
          }
          processResponse(xhr, e);
        };

        if (settings.progressObserver) {
          xhr.onprogress = function (e) {
            settings.progressObserver.onNext(e);
          };
        }

        xhr.onerror = function (e) {
          if (settings.progressObserver) {
            settings.progressObserver.onError(e);
          }
          observer.onError(normalizeError(e, xhr, 'error'));
          isDone = true;
        };

        xhr.onabort = function (e) {
          if (settings.progressObserver) {
            settings.progressObserver.onError(e);
          }
          observer.onError(normalizeError(e, xhr, 'abort'));
          isDone = true;
        };
      } else {

        xhr.onreadystatechange = function (e) {
          if (xhr.readyState === 4) {
            processResponse(xhr, e);
          }
        };
      }

      xhr.send(settings.hasContent && settings.body || null);
    } catch (e) {
      observer.onError(e);
    }

    return function () {
      if (!isDone && xhr.readyState !== 4) {
        xhr.abort();
      }
    };
  });
};

;
module.exports = exports["default"];
