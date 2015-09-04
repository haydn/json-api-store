export default class AjaxAdapter {

  constructor(options) {
    this._base = (options && options.base) || "";
  };

  create(store, type, partial, success, error, context) {

    let request = new XMLHttpRequest();

    request.open('POST', `${this._base}/${type}`, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 300) {
        let response = JSON.parse(request.responseText);
        store.push(response);
        success.call(context, store.find(response.data.type, response.data.id));
      } else {
        error.call(context);
      }
    };

    request.send({
      data: JSON.stringify(store.convert(type, partial))
    });

  }

  destroy(store, type, id, success, error, context) {

    let request = new XMLHttpRequest();

    request.open('DELETE', `${this._base}/${type}/${id}`, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 300) {
        store.remove(type, id);
        success.call(context);
      } else {
        error.call(context);
      }
    };

    request.send();

  }

  load(store, type, id, options, success, error, context) {

    if (id && {}.toString.call(id) === '[object Function]') {
      this.load(store, type, null, null, id, options, success);
    } else if (id && typeof id === "object") {
      this.load(store, type, null, id, options, success, error);
    } else if (options && {}.toString.call(options) === '[object Function]') {
      this.load(store, type, id, null, options, success, error);
    } else {

      let request = new XMLHttpRequest();
      let url;

      options = options || {};
      url = id ? `${this._base}/${type}/${id}` : `${this._base}/${type}`;

      request.open('GET', url, true);

      request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
          store.push(JSON.parse(request.responseText));
          if (id) {
            success.call(context, store.find(type, id));
          } else {
            success.call(context, store.find(type));
          }
        } else {
          error.call(context);
        }
      };

      request.send();

    }

  }

  update(store, type, id, partial, success, error, context) {

    let request = new XMLHttpRequest();
    let data = store.convert(type, id, partial);

    request.open('PATCH', `${this._base}/${type}/${id}`, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 300) {
        store.add(data);
        success.call(context, store.find(data.type, data.id));
      } else {
        error.call(context);
      }
    };

    request.send({
      data: JSON.stringify(data)
    });

  }

}
