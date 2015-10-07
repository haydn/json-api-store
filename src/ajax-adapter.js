import ajax from "./ajax";

export default class AjaxAdapter {

  constructor(options) {
    this._base = (options && options.base) || "";
  };

  create(store, type, partial, options) {

    if (!store._types[type]) {
      throw new Error(`Unknown type '${type}'`);
    }

    let source = ajax({
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
    }).do(e => store.push(e.response))
      .map(e => store.find(e.response.data.type, e.response.data.id))
      .publish();

    source.connect();

    return source;

  }

  destroy(store, type, id, options) {

    if (!store._types[type]) {
      throw new Error(`Unknown type '${type}'`);
    }

    let source = ajax({
      crossDomain: true,
      headers: {
        "Content-Type": "application/vnd.api+json"
      },
      method: "DELETE",
      responseType: "auto",
      url: this._getUrl(type, id, options)
    }).do(() => store.remove(type, id))
      .publish();

    source.connect();

    return source;

  }

  load(store, type, id, options) {

    if (id && typeof id === "object") {
      return this.load(store, type, null, id);
    }

    if (!store._types[type]) {
      throw new Error(`Unknown type '${type}'`);
    }

    let source = ajax({
      crossDomain: true,
      headers: {
        "Content-Type": "application/vnd.api+json"
      },
      method: "GET",
      responseType: "auto",
      url: this._getUrl(type, id, options)
    }).do(e => store.push(e.response))
      .map(() => id ? store.find(type, id) : store.findAll(type))
      .publish();

    source.connect();

    return source;

  }

  update(store, type, id, partial, options) {

    if (!store._types[type]) {
      throw new Error(`Unknown type '${type}'`);
    }

    let data = store.convert(type, id, partial);

    let source = ajax({
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
    }).do(() => store.add(data))
      .map(() => store.find(type, id))
      .publish();

    source.connect();

    return source;

  }

  _getUrl(type, id, options) {

    let params = [];
    let url = id ? `${this._base}/${type}/${id}` : `${this._base}/${type}`;

    if (options) {

      if (options.fields) {
        Object.keys(options.fields).forEach(field => {
          options[`fields[${field}]`] = options.fields[field];
        });
        delete options.fields;
      }

      params = Object.keys(options).map(key => {
        return key + "=" + encodeURIComponent(options[key]);
      }).sort();

      if (params.length) {
        url = `${url}?${params.join("&")}`;
      }

    }

    return url;

  }

}
