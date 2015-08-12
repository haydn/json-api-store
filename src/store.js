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
        throw new TypeError(`Unknown type '${type}'`);
      }
    } else {
      throw new TypeError(`You must provide a type`);
    }
  }

  push(root) {
    if (root.data.constructor === Array) {
      root.data.forEach(x => this.add(x));
    } else {
      this.add(root.data);
    }
    if (root.included) {
      root.included.forEach(x => this.add(x));
    }
  }

  add(data) {
    var object, type;
    if (data) {
      if (data.type && data.id) {
        object = this.find(data.type, data.id);
        type = Store.types[data.type];
        Object.keys(type).forEach(key => {
          var result = type[key].deserialize.call(this, data, key);
          if (typeof result !== 'undefined') {
            object[key] = result;
          }
        });
      } else {
        throw new TypeError(`The data must have a type and id`);
      }
    } else {
      throw new TypeError(`You must provide data to add`);
    }
  }

  remove(type, id) {
    if (type) {
      if (Store.types[type]) {
        if (id) {
          if (this._data[type][id]) {
            delete this._data[type][id];
          }
        } else {
          delete this._data[type];
        }
      } else {
        throw new TypeError(`Unknown type '${type}'`);
      }
    } else {
      throw new TypeError(`You must provide a type to remove`);
    }
  }

}

Store.types = {};

Store.attr = function(name) {
  return {
    deserialize: function (data, key) {
      return data.attributes && data.attributes[name || key];
    }
  };
};

Store.hasOne = function(name) {
  return {
    deserialize: function (data, key) {
      name = name || key;
      if (data.relationships && data.relationships[name] && data.relationships[name].data) {
        return this.find(data.relationships[name].data.type, data.relationships[name].data.id);
      }
    }
  };
};

Store.hasMany = function(name) {
  return {
    deserialize: function (data, key) {
      name = name || key;
      if (data.relationships && data.relationships[name] && data.relationships[name].data) {
        return data.relationships[name].data.map((c) => {
          return this.find(c.type, c.id);
        });
      }
    }
  };
};
