export default class AjaxAdapter {

  create(store, resource, callback) {

    let request = new XMLHttpRequest();

    request.open('POST', `/${resource.type}`, true);

    request.onload = function () {
      var response = JSON.parse(request.responseText);
      store.push(response);
      callback(store.find(response.data.type, response.data.id));
    };

    request.send({
      data: JSON.stringify(store.convert(resource))
    });

  }

  destroy(store, resource, callback) {

    let request = new XMLHttpRequest();

    request.open('DELETE', `/${resource.type}/${resource.id}`, true);

    request.onload = function () {
      store.remove(resource.type, resource.id);
      callback();
    };

    request.send();

  }

  load(store, type, id, options, callback) {

    if (id && {}.toString.call(id) === '[object Function]') {
      this.load(store, type, null, null, id);
    } else if (options && {}.toString.call(options) === '[object Function]') {
      this.load(store, type, id, null, options);
    } else if (id && typeof id === "object") {
      this.load(store, type, null, id, callback);
    } else {

      let request = new XMLHttpRequest();
      let url;

      options = options || {};
      url = id ? `/${type}/${id}` : `/${type}`;

      request.open('GET', url, true);

      request.onload = function () {
        store.push(JSON.parse(request.responseText));
        callback(store.find(type, id));
      };

      request.send();

    }

  }

  update(store, resource, callback) {

    let request = new XMLHttpRequest();
    let data = store.convert(resource);

    request.open('PATCH', `/${resource.type}/${resource.id}`, true);

    request.onload = function () {
      store.add(data);
      callback(store.find(data.type, data.id));
    };

    request.send({
      data: JSON.stringify(data)
    });

  }

}
