import "array.prototype.find";
import Rx from "rx";
import AjaxAdapter from "./ajax-adapter";

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
        },
        serialize: function (resource, data, key) {
          data.attributes[name || key] = resource[key];
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
        },
        serialize: function serialize(resource, data, key) {
          if (resource[key] === null) {
            data.relationships[name || key] = null;
          } else if (resource[key]) {
            data.relationships[name || key] = {
              data: {
                type: resource[key].type,
                id: resource[key].id
              }
            };
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
        },
        serialize: function serialize(resource, data, key) {
          if (resource[key]) {
            data.relationships[name || key] = {
              data: resource[key].map(x => {
                return { type: x.type, id: x.id };
              })
            };
          }
        }
      };
    }
  }

  constructor(adapter) {

    this._adapter = adapter;
    this._data = {};
    this._subject = new Rx.Subject();
    this._subscriptions = {};
    this._types = {};

    /**
     * An observable that will emit events when any resource in added, updated
     * or removed. The object passed to listeners will be in this format:
     *
     * <p><pre class="source-code">
     * { name: string, type: string, id: string, resource: object }
     * </pre></p>
     *
     * You can learn more about RxJS observables at the GitHub repo:
     * https://github.com/Reactive-Extensions/RxJS
     *
     * @type {Rx.Observable}
     * @since 0.6.0
     *
     * @example
     * let store = new Store();
     *
     * store.observable.filter(e => e.name === "added").subscribe(event => {
     *   console.log(event.name); // "added"
     *   console.log(event.type); // "products"
     *   console.log(event.id); // "1"
     *   console.log(event.resource); // Map {...}
     * });
     *
     * store.observable.filter(e => e.name === "updated").subscribe(event => {
     *   console.log(event.name); // "updated"
     *   console.log(event.type); // "products"
     *   console.log(event.id); // "1"
     *   console.log(event.resource); // Map {...}
     * });
     *
     * store.observable.filter(e => e.name === "removed").subscribe(event => {
     *   console.log(event.name); // "removed"
     *   console.log(event.type); // "products"
     *   console.log(event.id); // "1"
     *   console.log(event.resource); // null
     * });
     */
    this.observable = this._subject.asObservable();

  }

  /**
   * Add an individual resource to the store. This is used internally by the
   * `push()` method.
   *
   * @since 0.1.0
   * @param {!Object} object - A JSON API Resource Object to be added. See:
            http://jsonapi.org/format/#document-resource-objects
   */
  add(object) {
    if (object) {
      if (object.type && object.id) {
        let name = this._data[object.type] && this._data[object.type][object.id] ? "updated" : "added";
        let resource = this.find(object.type, object.id);
        let definition = this._types[object.type];
        Object.keys(definition).forEach(fieldName => {
          if (fieldName[0] !== "_") {
            this._addField(object, resource, definition, fieldName);
          }
        });
        this._subject.onNext({
          name: name,
          type: object.type,
          id: object.id,
          resource: resource
        });
      } else {
        throw new TypeError(`The data must have a type and id`);
      }
    } else {
      throw new TypeError(`You must provide data to add`);
    }
  }

  /**
   * Converts the given partial into a JSON API compliant representation.
   *
   * @since 0.5.0
   * @param {!string} [type] - The type of the resource. This can be omitted if the partial includes a type property.
   * @param {!string} [id] - The id of the resource. This can be omitted if the partial includes an id property.
   * @param {!object} partial - The data to convert.
   * @return {object} - JSON API version of the object.
   */
  convert(type, id, partial) {
    if (type && typeof type === "object") {
      return this.convert(type.type, type.id, type);
    } else if (id && typeof id === "object") {
      return this.convert(type, id.id, id);
    } else {
      let data = {
        type: type,
        attributes: {},
        relationships: {}
      };
      if (id) {
        data.id = id;
      }
      let definition = this._types[data.type];
      Object.keys(definition).forEach(fieldName => {
        if (fieldName[0] !== "_") {
          definition[fieldName].serialize(partial, data, fieldName);
        }
      });
      return data;
    }
  }

  /**
   * Attempts to create the resource through the adapter and adds it to  the
   * store if successful.
   *
   * @since 0.5.0
   * @param {!string} type - Type of resource.
   * @param {!Object} partial - Data to create the resource with.
   * @param {Object} [options] - Options to pass to the adapter.
   * @return {Rx.Observable}
   *
   * @example
   * let adapter = new Store.AjaxAdapter();
   * let store = new Store(adpater);
   * store.create("product", { title: "A Book" }).subscribe((product) => {
   *   console.log(product.title);
   * });
   */
  create(type, partial, options) {
    if (this._adapter) {
      return this._adapter.create(this, type, partial, options);
    } else {
      throw new Error("Adapter missing. Specify an adapter when creating the store: `var store = new Store(adapter);`");
    }
  }

  /**
   * Defines a type of resource.
   *
   * @since 0.2.0
   * @param {!string|string[]} names - Name(s) of the resource.
   * @param {!Object} definition - The resource's definition.
   */
  define(names, definition) {
    names = (names.constructor === Array) ? names : [ names ];
    if (definition) {
      definition._names = names;
      names.forEach(name => {
        if (!this._types[name]) {
          this._types[name] = definition;
        } else {
          throw new Error(`The type '${name}' has already been defined.`);
        }
      });
    } else {
      throw new Error(`You must provide a definition for the type '${names[0]}'.`);
    }
  }

  /**
   * Attempts to delete the resource through the adapter and removes it from
   * the store if successful.
   *
   * @since 0.5.0
   * @param {!string} type - Type of resource.
   * @param {!string} id - ID of resource.
   * @param {Object} [options] - Options to pass to the adapter.
   * @return {Rx.Observable}
   *
   * @example
   * let adapter = new Store.AjaxAdapter();
   * let store = new Store(adpater);
   * store.destroy("product", "1").subscribe(() => {
   *   console.log("Destroyed!");
   * });
   */
  destroy(type, id, options) {
    if (this._adapter) {
      return this._adapter.destroy(this, type, id, options);
    } else {
      throw new Error("Adapter missing. Specify an adapter when creating the store: `var store = new Store(adapter);`");
    }
  }

  /**
   * Finds a resource by type and id.
   *
   * NOTE: If the resource hasn't been loaded via an add() or push() call it
   * will be automatically created when find is called.
   *
   * @since 0.1.0
   * @param {!string} type - Type of the resource to find.
   * @param {!string} id - The id of the resource to find.
   * @return {Object} - The resource.
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
          // throw new TypeError(`You must provide an id`);
          /*eslint-disable*/
          console.warn([
            "Using the `store.find()` method to find an entire collection has been deprecated in favour of `store.findAll()`.",
            "For more information see: https://github.com/haydn/json-api-store/releases/tag/v0.7.0"
          ].join("\n"));
          /*eslint-enable*/
          return this.findAll(type);
        }
      } else {
        throw new TypeError(`Unknown type '${type}'`);
      }
    } else {
      throw new TypeError(`You must provide a type`);
    }
  }

  /**
   * Finds all the resources of a given type.
   *
   * @since 0.7.0
   * @param {!string} type - Type of the resource to find.
   * @return {Object[]} - An array of resources.
   */
  findAll(type) {
    if (type) {
      let definition = this._types[type];
      if (definition) {
        if (!this._data[type]) {
          let collection = {};
          definition._names.forEach(t => this._data[t] = collection);
        }
        return Object.keys(this._data[type]).map(x => this._data[type][x]);
      } else {
        throw new TypeError(`Unknown type '${type}'`);
      }
    } else {
      throw new TypeError(`You must provide a type`);
    }
  }

  /**
   * Attempts to load the given resource through the adapter and adds it to the
   * store if successful.
   *
   * @since 0.5.0
   * @param {!string} type - Type of resource.
   * @param {!string} id - ID of resource.
   * @param {Object} [options] - Options to pass to the adapter.
   * @return {Rx.Observable}
   *
   * @example
   * let adapter = new Store.AjaxAdapter();
   * let store = new Store(adpater);
   * store.load("products", "1").subscribe((product) => {
   *   console.log(product.title);
   * });
   */
  load(type, id, options) {
    if (!id || typeof id === "object") {
      /*eslint-disable*/
      console.warn([
        "Using the `store.load()` method to load an entire collection has been deprecated in favour of `store.loadAll()`.",
        "For more information see: https://github.com/haydn/json-api-store/releases/tag/v0.7.0"
      ].join("\n"));
      /*eslint-enable*/
    }
    if (this._adapter) {
      return this._adapter.load(this, type, id, options);
    } else {
      throw new Error("Adapter missing. Specify an adapter when creating the store: `var store = new Store(adapter);`");
    }
  }

  /**
   * Attempts to load all the resources of the given type through the adapter
   * and adds them to the store if successful.
   *
   * @since 0.7.0
   * @param {!string} type - Type of resource.
   * @param {Object} [options] - Options to pass to the adapter.
   * @return {Rx.Observable}
   *
   * @example
   * let adapter = new Store.AjaxAdapter();
   * let store = new Store(adpater);
   * store.loadAll("products").subscribe((products) => {
   *   console.log(products);
   * });
   */
  loadAll(type, options) {
    if (this._adapter) {
      return this._adapter.load(this, type, null, options);
    } else {
      throw new Error("Adapter missing. Specify an adapter when creating the store: `var store = new Store(adapter);`");
    }
  }

  /**
   * Unregister an event listener that was registered with on().
   *
   * @deprecated Use the <code>store.observable</code> property instead of this.
   * @since 0.4.0
   * @param {string} event - Name of the event.
   * @param {string} type - Name of resource to originally passed to on().
   * @param {string} [id] - ID of the resource to originally passed to on().
   * @param {function} callback - Function originally passed to on().
   */
  off(event, type, id, callback) {
    /*eslint-disable*/
    console.warn([
      "The `store.off()` method has been deprecated in favour of `store.observable`.",
      "For more information see: https://github.com/haydn/json-api-store/releases/tag/v0.6.0"
    ].join("\n"));
    /*eslint-enable*/
    if (event === "added" || event === "updated" || event === "removed") {
      if (this._types[type]) {
        if (id && ({}).toString.call(id) === '[object Function]') {
          this.off.call(this, event, type, null, id, callback);
        } else if (this._subscriptions[event] && this._subscriptions[event][type] && this._subscriptions[event][type][id || "*"]) {
          this._subscriptions[event][type][id || "*"].dispose();
          delete this._subscriptions[event][type][id || "*"];
        }
      } else {
        throw new Error(`Unknown type '${type}'`);
      }
    } else {
      throw new Error(`Unknown event '${event}'`);
    }
  }

  /**
   * Register an event listener: "added", "updated" or "removed".
   *
   * @deprecated Use the <code>store.observable</code> property instead of this.
   * @since 0.4.0
   * @param {string} event - Name of the event.
   * @param {string} type - Name of resource to watch.
   * @param {string} [id] - ID of the resource to watch.
   * @param {function} callback - Function to call when the event occurs.
   * @param {Object} [context] - Context in which to call the callback.
   */
  on(event, type, id, callback, context) {
    /*eslint-disable*/
    console.warn([
      "The `store.on()` method has been deprecated in favour of `store.observable`.",
      "For more information see: https://github.com/haydn/json-api-store/releases/tag/v0.6.0"
    ].join("\n"));
    /*eslint-enable*/
    if (event === "added" || event === "updated" || event === "removed") {
      if (this._types[type]) {
        if (id && ({}).toString.call(id) === '[object Function]') {
          this.on.call(this, event, type, null, id, callback);
        } else if (!this._subscriptions[event] || !this._subscriptions[event][type] || !this._subscriptions[event][type][id || "*"]) {
          let subscription = this._subject.filter(e => e.name === event);
          subscription = subscription.filter(e => this._types[type]._names.indexOf(e.type) !== -1);
          if (id) {
            subscription = subscription.filter(e => e.id === id);
          }
          subscription = subscription.map(e => this.find(e.type, e.id));
          this._subscriptions[event] = this._subscriptions[event] || {};
          if (!this._subscriptions[event][type]) {
            let obj = {};
            this._types[type]._names.forEach(type => {
              this._subscriptions[event][type] = obj;
            });
          }
          this._subscriptions[event][type][id || "*"] = subscription.subscribe(callback.bind(context));
        }
      } else {
        throw new Error(`Unknown type '${type}'`);
      }
    } else {
      throw new Error(`Unknown event '${event}'`);
    }
  }

  /**
   * Add a JSON API response to the store. This method can be used to handle a
   * successful GET or POST response from the server.
   *
   * @since 0.1.0
   * @param {Object} root - Top Level Object to push. See:
                            http://jsonapi.org/format/#document-top-level
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
   */
  remove(type, id) {
    if (type) {
      if (this._types[type]) {
        if (id) {
          let resource = this._data[type] && this._data[type][id];
          if (resource) {
            this._remove(resource);
            this._subject.onNext({
              name: "removed",
              type: type,
              id: id,
              resource: null
            });
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

  /**
   * Attempts to update the resource through the adapter and updates it in  the
   * store if successful.
   *
   * @since 0.5.0
   * @param {!string} type - Type of resource.
   * @param {!string} id - ID of resource.
   * @param {!Object} partial - Data to update the resource with.
   * @param {Object} [options] - Options to pass to the adapter.
   * @return {Rx.Observable}
   *
   * @example
   * let adapter = new Store.AjaxAdapter();
   * let store = new Store(adpater);
   * store.update("product", "1", { title: "foo" }).subscribe((product) => {
   *   console.log(product.title);
   * });
   */
  update(type, id, partial, options) {
    if (this._adapter) {
      return this._adapter.update(this, type, id, partial, options);
    } else {
      throw new Error("Adapter missing. Specify an adapter when creating the store: `var store = new Store(adapter);`");
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

Store.Rx = Rx;
Store.AjaxAdapter = AjaxAdapter;
