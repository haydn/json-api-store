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
    if (data) {
      if (data.type && data.id) {
        let resource = this.find(data.type, data.id);
        let definition = Store.types[data.type];
        Object.keys(definition).forEach(fieldName => {
          this._addField(data, resource, definition, fieldName);
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
            this._remove(resource);
          }
        } else {
          Object.keys(this._data[type]).forEach(id => this.remove(type, id));
        }
      } else {
        throw new TypeError(`Unknown type '${type}'`);
      }
    } else {
      throw new TypeError(`You must provide a type to remove`);
    }
  }

  _addField(data, resource, definition, fieldName) {
    var field = definition[fieldName];
    var newValue = field.deserialize.call(this, data, fieldName);
    if (typeof newValue !== "undefined") {
      if (field.type === "has-one") {
        if (resource[fieldName]) {
          this._removeInverseRelationship(resource, fieldName, resource[fieldName], field);
        }
        if (newValue) {
          this._addInverseRelationship(resource, fieldName, newValue, field);
        }
      } else if (field.type === "has-many") {
        resource[fieldName].forEach(r => {
          if (resource[fieldName].indexOf(r) !== -1) {
            this._removeInverseRelationship(resource, fieldName, r, field);
          }
        });
        newValue.forEach(r => {
          this._addInverseRelationship(resource, fieldName, r, field);
        });
      }
      resource[fieldName] = newValue;
    }
  }

  _addInverseRelationship(sourceResource, sourceFieldName, targetResource, sourceField) {
    var targetDefinition = Store.types[targetResource.type];
    var targetFieldName = sourceField.inverse || targetResource.type;
    var targetField = targetDefinition && targetDefinition[targetFieldName];
    targetResource._dependents.push({ type: sourceResource.type, id: sourceResource.id, fieldName: sourceFieldName });
    if (targetField) {
      if (targetField.type === "has-one") {
        sourceResource._dependents.push({ type: targetResource.type, id: targetResource.id, fieldName: targetFieldName });
        targetResource[targetFieldName] = sourceResource;
      } else if (targetField.type === "has-many") {
        sourceResource._dependents.push({ type: targetResource.type, id: targetResource.id, fieldName: targetFieldName });
        if (targetResource[targetFieldName].indexOf(sourceResource) === -1) {
          targetResource[targetFieldName].push(sourceResource);
        }
      } else if (targetField.type === "attr") {
        throw new Error(`The the inverse relationship for '${sourceFieldName}' is an attribute ('${targetFieldName}')`);
      }
    } else if (sourceField.inverse) {
      throw new Error(`The the inverse relationship for '${sourceFieldName}' is missing ('${sourceField.inverse}')`);
    }
  }

  _remove(resource) {
    resource._dependents.forEach(dependent => {
      let dependentResource = this._data[dependent.type][dependent.id];
      switch (Store.types[dependent.type][dependent.fieldName].type) {
        case "has-one": {
          dependentResource[dependent.fieldName] = null;
          break;
        }
        case "has-many": {
          let index = dependentResource[dependent.fieldName].indexOf(resource);
          if (index !== -1) {
            dependentResource[dependent.fieldName].splice(index, 1);
          }
          break;
        }
        default: {
          break;
        }
      }
      // TODO: This only needs to be run once for each dependent.
      dependentResource._dependents = dependentResource._dependents.filter(d => {
        return !(d.type === resource.type && d.id === resource.id);
      });
    });
    delete this._data[resource.type][resource.id];
  }

  _removeInverseRelationship(sourceResource, sourceFieldName, targetResource, sourceField) {
    var targetDefinition = Store.types[targetResource.type];
    var targetFieldName = sourceField.inverse || targetResource.type;
    var targetField = targetDefinition && targetDefinition[targetFieldName];
    targetResource._dependents = targetResource._dependents.filter(r => {
      return !(r.type === sourceResource.type && r.id === sourceResource.id && r.fieldName === sourceFieldName);
    });
    if (targetField) {
      if (targetField.type === "has-one") {
        sourceResource._dependents = sourceResource._dependents.filter(r => {
          return !(r.type === targetResource.type && r.id === targetResource.id && r.fieldName === targetFieldName);
        });
        targetResource[targetFieldName] = null;
      } else if (targetField.type === "has-many") {
        sourceResource._dependents = sourceResource._dependents.filter(r => {
          return !(r.type === targetResource.type && r.id === targetResource.id && r.fieldName === targetFieldName);
        });
        targetResource[targetFieldName] = targetResource[targetFieldName].filter(r => {
          return r !== sourceResource;
        });
      } else if (targetField.type === "attr") {
        throw new Error(`The the inverse relationship for '${sourceFieldName}' is an attribute ('${targetFieldName}')`);
      }
    } else if (sourceField.inverse) {
      throw new Error(`The the inverse relationship for '${sourceFieldName}' is missing ('${sourceField.inverse}')`);
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
        if (data.relationships && data.relationships[name]) {
          if (data.relationships[name].data === null) {
            return null;
          } else if (data.relationships[name].data) {
            return this.find(data.relationships[name].data.type, data.relationships[name].data.id);
          }
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
        if (data.relationships && data.relationships[name]) {
          if (data.relationships[name].data === null) {
            return [];
          } else if (data.relationships[name].data) {
            return data.relationships[name].data.map((c) => {
              return this.find(c.type, c.id);
            });
          }
        }
      }
    };
  }
};
