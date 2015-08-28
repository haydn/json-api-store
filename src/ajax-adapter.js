export default class AjaxAdapter {

  // create(store, type, data, callback) {
  //
  //   let request = new XMLHttpRequest();
  //
  //   request.open('POST', `/${type}`, true);
  //
  //   request.onload = function () {
  //     var data = JSON.parse(request.responseText);
  //     store.push(data);
  //     callback(store.find(type, data.id));
  //   };
  //
  //   // we need to convert to data here.
  //
  //   request.send({
  //     data: JSON.stringify(data)
  //   });
  //
  // }

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

}
