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
              _dependents: [],
              type: type,
              id: id
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
        Object.keys(definition).forEach(name => {
          var field = definition[name];
          var result = field.deserialize.call(this, data, name);
          if (result) {
            if (field.type === "has-one") {
              result._dependents.push({ type: data.type, id: data.id, fieldName: name });
              this._addInverseRelationship(object, name, result, field);
            } else if (field.type === "has-many") {
              result.forEach(r => {
                r._dependents.push({ type: data.type, id: data.id, fieldName: name });
                this._addInverseRelationship(object, name, r, field);
              });
            }
          }
          if (typeof result !== 'undefined') {
            object[name] = result;
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
          let resource = this._data[type][id];
          if (resource) {
            resource._dependents.forEach(r => {
              let relation = this._data[r.type][r.id];
              if (Store.types[r.type][r.fieldName].type === "has-one") {
                relation[r.fieldName] = null;
              } else {
                let index = relation[r.fieldName].indexOf(resource);
                relation[r.fieldName].splice(index, 1);
              }
              // TODO: This only need to be run once for each relation.
              relation._dependents = relation._dependents.filter(r => {
                return !(r.type === type && r.id === id);
              });
            });
            delete this._data[type][id];
          }
        } else {
          Object.keys(this._data[type]).forEach(id => {
            this.remove(type, id);
          });
        }
      } else {
        throw new TypeError(`Unknown type '${type}'`);
      }
    } else {
      throw new TypeError(`You must provide a type to remove`);
    }
  }

  _addInverseRelationship(object, key, result, field) {
    var definition = Store.types[result.type];
    var name = field.inverse || result.type;
    var field = definition && definition[name];
    if (field) {
      if (field.type === "has-one") {
        object._dependents.push({ type: result.type, id: result.id, fieldName: name });
        result[name] = object;
      } else if (field.type === "has-many") {
        object._dependents.push({ type: result.type, id: result.id, fieldName: name });
        if (result[name].indexOf(object) === -1) {
          result[name].push(object);
        }
      } else if (field.type === "attr") {
        throw new Error(`The the inverse relationship for '${key}' is an attribute ('${name}')`);
      }
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
