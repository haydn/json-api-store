export default class Store {

  constructor() {
    this._data = {};
  }

  find(type, id) {
    if (type) {
      if (Store.types[type]) {
        this._data[type] = this._data[type] || {};
        if (id) {
          return this._data[type][id] = this._data[type][id] || {
            "type": type,
            "id": id
          };
        } else {
          return Object.keys(this._data[type]).map(x => this._data[type][x]);
        }
      } else {
        throw new TypeError(`Missing type '${type}'`);
      }
    } else {
      throw new TypeError(`You must provide a type`);
    }
  }

  push(root) {
    if (root.data.constructor === Array) {
      return root.data.map(x => this.add(x));
    } else {
      return this.add(root.data);
    }
  }

  add(data) {
    if (data) {
      if (data.type && data.id) {
        return this.find(data.type, data.id);
      } else {
        throw new TypeError(`The data must have a type and id`);
      }
    } else {
      throw new TypeError(`You must provide data to add`);
    }
  }

}

Store.types = {};
