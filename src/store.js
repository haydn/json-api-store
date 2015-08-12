export default class Store {

  constructor() {
    this._data = {};
  }

  find(type, id) {
    var definition;
    if (type) {
      definition = Store.types[type];
      if (definition) {
        this._data[type] = this._data[type] || {};
        if (id) {
          if (!this._data[type][id]) {
            this._data[type][id] = {
              "type": type,
              "id": id
            };
            Object.keys(definition).forEach(key => {
              this._data[type][id][key] = definition[key].default;
            });
          }
          return this._data[type][id];
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
    var object, definition;
    if (data) {
      if (data.type && data.id) {
        object = this.find(data.type, data.id);
        definition = Store.types[data.type];
        Object.keys(definition).forEach(key => {
          var field = definition[key];
          var result = field.deserialize.call(this, data, key);
          if (field.type === "has-one") {
            this._setupHasOneInverseRelationship(object, key, result, field);
          }
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

  _setupHasOneInverseRelationship(object, key, result, field) {
    var definition = Store.types[result.type];
    var name = field.inverse || data.type;
    var field = definition && definition[name];
    if (field) {
      if (field.type === "has-one") {
        result[name] = object;
      } else if (field.type === "has-many") {
        if (result[name].indexOf(object) === -1) {
          result[name].push(object);
        }
      } else if (field.type === "attr") {
        throw new Error(`The the inverse relationship for '${key}' is an attribute ('${name}')`);
      }
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

Store.attr = function(name, options) {
  if (name && typeof name === 'object') {
    return Store.attr(null, name);
  } else {
    return {
      type: "attr",
      default: options && options.default,
      deserialize: function (data, key) {
        return data.attributes && data.attributes[name || key];
      }
    };
  }
};

Store.hasOne = function(name, options) {
  if (name && typeof name === 'object') {
    return Store.hasOne(null, name);
  } else {
    return {
      type: "has-one",
      inverse: options && options.inverse,
      deserialize: function (data, key) {
        name = name || key;
        if (data.relationships && data.relationships[name] && data.relationships[name].data) {
          return this.find(data.relationships[name].data.type, data.relationships[name].data.id);
        }
      }
    };
  }
};

Store.hasMany = function(name, options) {
  if (name && typeof name === 'object') {
    return Store.hasMany(null, name);
  } else {
    return {
      type: "has-many",
      default: [],
      inverse: options && options.inverse,
      deserialize: function (data, key) {
        name = name || key;
        if (data.relationships && data.relationships[name] && data.relationships[name].data) {
          return data.relationships[name].data.map((c) => {
            return this.find(c.type, c.id);
          });
        }
      }
    };
  }
};
