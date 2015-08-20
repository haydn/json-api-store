import "array.prototype.find";

export default class Store {

  /**
   * Creates a field definition for an attribute.
   *
   * @since 0.1.0
   * @param {string} [name] - Name of the property to map this field from.
   * @param {Object} [options] - An options object.
   * @param {string} [options.default] - Default value for this field.
   * @return {Object} - Field definition.
   */
  static attr(name, options) {
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
  }

  /**
   * Creates a field definition for an has-one relationship.
   *
   * @since 0.1.0
   * @param {string} [name] - Name of the property to map this field from.
   * @param {Object} [options] - An options object.
   * @param {string} [options.inverse] - Name of the inverse relationship.
   * @return {Object} - Field definition.
   */
  static hasOne(name, options) {
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
  }

  /**
   * Creates a field definition for an has-many relationship.
   *
   * @since 0.1.0
   * @param {string} [name] - Name of the property to map this field from.
   * @param {Object} [options] - An options object.
   * @param {string} [options.inverse] - Name of the inverse relationship.
   * @return {Object} - Field definition.
   */
  static hasMany(name, options) {
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
  }

  constructor() {
    this._data = {};
    this._types = {};
  }

  /**
   * Add an individual resource to the store. This is used internally by the
   * `push()` method.
   *
   * @since 0.1.0
   * @param {!Object} object - Resource Object to add. See:
            http://jsonapi.org/format/#document-resource-objects
   * @return {undefined} - Nothing.
   */
  add(object) {
    if (object) {
      if (object.type && object.id) {
        let resource = this.find(object.type, object.id);
        let definition = this._types[object.type];
        Object.keys(definition).forEach(fieldName => {
          if (fieldName[0] !== "_") {
            this._addField(object, resource, definition, fieldName);
          }
        });
      } else {
        throw new TypeError(`The data must have a type and id`);
      }
    } else {
      throw new TypeError(`You must provide data to add`);
    }
  }

  /**
   * Defines a type of resource.
   *
   * @since 0.2.0
   * @param {!string|string[]} names - Name(s) of the resource.
   * @param {!Object} definition - The resource's definition.
   * @return {undefined} - Nothing.
   */
  define(names, definition) {
    names = (names.constructor === Array) ? names : [ names ];
    definition._names = names;
    names.forEach(name => {
      if (!this._types[name]) {
        this._types[name] = definition;
      } else {
        throw new Error(`The type '${name}' has already been defined.`);
      }
    });
  }

  /**
   * Find a resource or entire collection of resources.
   *
   * NOTE: If the resource hasn't been loaded via an add() or push() call it
   * will be automatically created when find is called.
   *
   * @since 0.1.0
   * @param {!string} type - Type of the resource(s) to find.
   * @param {string} [id] - The id of the resource to find. If omitted all
   *                        resources of the type will be returned.
   * @return {Object|Object[]} - Either the resource or an array of resources.
   */
  find(type, id) {
    if (type) {
      let definition = this._types[type];
      if (definition) {
        if (!this._data[type]) {
          let collection = {};
          definition._names.forEach(t => this._data[t] = collection);
        }
        if (id) {
          if (!this._data[type][id]) {
            this._data[type][id] = {
              _dependents: [],
              type: type,
              id: id
            };
            Object.keys(definition).forEach(key => {
              if (key[0] !== "_") {
                this._data[type][id][key] = definition[key].default;
              }
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

  /**
   * Add a JSON API response to the store. This method can be used to handle a
   * successful GET or POST response from the server.
   *
   * @since 0.1.0
   * @param {Object} root - Top Level Object to push. See:
                            http://jsonapi.org/format/#document-top-level
   * @return {undefined} - Nothing.
   */
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

  /**
   * Remove a resource or collection of resources from the store.
   *
   * @since 0.1.0
   * @param {!string} type - Type of the resource(s) to remove.
   * @param {string} [id] - The id of the resource to remove. If omitted all
   *                        resources of the type will be removed.
   * @return {undefined} - Nothing.
   */
  remove(type, id) {
    if (type) {
      if (this._types[type]) {
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

  _addField(object, resource, definition, fieldName) {
    var field = definition[fieldName];
    var newValue = field.deserialize.call(this, object, fieldName);
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
    var targetDefinition = this._types[targetResource.type];
    var sourceDefinition = this._types[sourceResource.type];
    if (targetDefinition) {
      let targetFieldName = [ sourceField.inverse ].concat(sourceDefinition._names).find(x => targetDefinition[x]);
      let targetField = targetDefinition && targetDefinition[targetFieldName];
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
  }

  _remove(resource) {
    resource._dependents.forEach(dependent => {
      let dependentResource = this._data[dependent.type][dependent.id];
      switch (this._types[dependent.type][dependent.fieldName].type) {
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
    var targetDefinition = this._types[targetResource.type];
    var targetFieldName = sourceField.inverse || sourceResource.type;
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
