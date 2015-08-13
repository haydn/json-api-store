var Store = require("../../src/store");

describe("add", function() {

  var store;

  beforeEach(function() {
    Store.types = {};
    store = new Store();
  });

  it("must add a resource to the store", function () {
    Store.types["products"] = {};
    store.add({
      "type": "products",
      "id": "44"
    });
    expect(store.find("products").length).toBe(1);
    expect(store.find("products")[0].id).toBe("44");
  });

  it("must throw an error if the data doesn't have a type and id", function () {
    expect(function () {
      store.add({});
    }).toThrowError(TypeError, "The data must have a type and id");
  });

  it("must throw an error when called without arguments", function () {
    expect(function () {
      store.add();
    }).toThrowError(TypeError, "You must provide data to add");
  });

  it("must throw an error if the type has not been defined", function () {
    expect(function () {
      store.add({
        "type": "products",
        "id": "44"
      });
    }).toThrowError(TypeError, "Unknown type 'products'");
  });

  it("must use deserialize functions provided by type definitions", function () {
    Store.types["products"] = {
      title: {
        deserialize: function (data, key) {
          return "Example " + data.id + " " + key;
        }
      }
    };
    store.add({
      "type": "products",
      "id": "44"
    });
    expect(store.find("products", "44").title).toBe("Example 44 title");
  });

  it("must not set fields when the deserialize function returns undefined", function () {
    Store.types["products"] = {
      title: {
        deserialize: function (data) {
          if (data.attributes && data.attributes.title) {
            return "Example";
          }
        }
      }
    };
    store.add({
      "type": "products",
      "id": "44",
      "attributes": {
        "title": true
      }
    });
    expect(store.find("products", "44").title).toBe("Example");
    store.add({
      "type": "products",
      "id": "44"
    });
    expect(store.find("products", "44").title).toBe("Example");
  });

  it("must set fields when the deserialize function returns null", function () {
    Store.types["products"] = {
      title: {
        deserialize: function (data) {
          if (data.attributes && data.attributes.title) {
            return "Example";
          } else {
            return null;
          }
        }
      }
    };
    store.add({
      "type": "products",
      "id": "44",
      "attributes": {
        "title": true
      }
    });
    expect(store.find("products", "44").title).toBe("Example");
    store.add({
      "type": "products",
      "id": "44"
    });
    expect(store.find("products", "44").title).toBe(null);
  });

  it("must call deserialize functions in the context of the store", function () {
    Store.types["products"] = {
      example: {
        deserialize: function () {
          return this;
        }
      }
    };
    store.add({
      "type": "products",
      "id": "44"
    });
    expect(store.find("products", "44").example).toBe(store);
  });

  it("must dependents to a resource", function () {
    Store.types["categories"] = {
      product: Store.hasOne({ inverse: "category" })
    };
    Store.types["comments"] = {
      product: Store.hasOne({ inverse: "comments" })
    };
    Store.types["products"] = {
      category: Store.hasOne({ inverse: "product" }),
      comments: Store.hasMany({ inverse: "product" })
    };
    store.add({
      "type": "products",
      "id": "29",
      "relationships": {
        "category": {
          "data": { "type": "categories", "id": "6" }
        },
        "comments": {
          "data": [
            { "type": "comments", "id": "87" }
          ]
        }
      }
    });
    expect(store.find("categories", "6")._dependents).toEqual([{ type: "products", id: "29", fieldName: "category" }]);
    expect(store.find("comments", "87")._dependents).toEqual([{ type: "products", id: "29", fieldName: "comments" }]);
    var relationships = store.find("products", "29")._dependents.sort(function (a, b) {
      return a.id > b.id ? 1 : -1;
    });
    expect(relationships[0]).toEqual({ type: "categories", id: "6", fieldName: "product" });
    expect(relationships[1]).toEqual({ type: "comments", id: "87", fieldName: "product" });
  });
  
  describe("inverse relationships", function () {

    it("must setup inverse one-to-one relationships", function () {
      Store.types["categories"] = {
        product: Store.hasOne({ inverse: "category" })
      };
      Store.types["products"] = {
        category: Store.hasOne({ inverse: "product" })
      };
      store.add({
        "type": "products",
        "id": "10",
        "relationships": {
          "category": {
            "data": { "type": "categories", "id": "1" }
          }
        }
      });
      expect(store.find("categories", "1").product).toBe(store.find("products", "10"));
    });

    it("must setup inverse one-to-many relationships", function () {
      Store.types["categories"] = {
        products: Store.hasMany({ inverse: "category" })
      };
      Store.types["products"] = {
        category: Store.hasOne({ inverse: "products" })
      };
      store.add({
        "type": "products",
        "id": "10",
        "relationships": {
          "category": {
            "data": { "type": "categories", "id": "1" }
          }
        }
      });
      store.add({
        "type": "products",
        "id": "20",
        "relationships": {
          "category": {
            "data": { "type": "categories", "id": "1" }
          }
        }
      });
      expect(store.find("categories", "1").products).toHaveIds([ "10", "20" ]);
    });

    it("must setup inverse many-to-many relationships", function () {
      Store.types["categories"] = {
        products: Store.hasMany({ inverse: "categories" })
      };
      Store.types["products"] = {
        categories: Store.hasMany({ inverse: "products" })
      };
      store.add({
        "type": "categories",
        "id": "10",
        "relationships": {
          "products": {
            "data": [
              { "type": "products", "id": "1" }
            ]
          }
        }
      });
      store.add({
        "type": "categories",
        "id": "20",
        "relationships": {
          "products": {
            "data": [
              { "type": "products", "id": "1" }
            ]
          }
        }
      });
      expect(store.find("products", "1").categories).toHaveIds([ "10", "20" ]);
    });

    it("must setup inverse many-to-one relationships", function () {
      Store.types["categories"] = {
        products: Store.hasMany({ inverse: "category" })
      };
      Store.types["products"] = {
        category: Store.hasOne({ inverse: "products" })
      };
      store.add({
        "type": "categories",
        "id": "10",
        "relationships": {
          "products": {
            "data": [
              { "type": "products", "id": "1" }
            ]
          }
        }
      });
      store.add({
        "type": "categories",
        "id": "20",
        "relationships": {
          "products": {
            "data": [
              { "type": "products", "id": "1" }
            ]
          }
        }
      });
      expect(store.find("products", "1").category).toBe(store.find("categories", "20"));
    });

    it("must throw an error when an inverse relationship is an attribute", function () {
      Store.types["categories"] = {
        product: Store.attr()
      };
      Store.types["comments"] = {
        product: Store.attr()
      };
      Store.types["products"] = {
        category: Store.hasOne({ inverse: "product" }),
        comments: Store.hasMany({ inverse: "product" }),
      };
      expect(function () {
        store.add({
          "type": "products",
          "id": "44",
          "relationships": {
            "category": {
              "data": { "type": "categories", "id": "34" }
            }
          }
        });
      }).toThrowError("The the inverse relationship for 'category' is an attribute ('product')");
      expect(function () {
        store.add({
          "type": "products",
          "id": "44",
          "relationships": {
            "comments": {
              "data": [
                { "type": "comments", "id": "3" }
              ]
            }
          }
        });
      }).toThrowError("The the inverse relationship for 'comments' is an attribute ('product')");
    });

    it("must ignore absent inverse relationships", function () {
      Store.types["categories"] = {};
      Store.types["comments"] = {};
      Store.types["products"] = {
        category: Store.hasOne({ inverse: "product" }),
        comments: Store.hasMany({ inverse: "product" })
      };
      store.add({
        "type": "products",
        "id": "44",
        "relationships": {
          "category": {
            "data": { "type": "categories", "id": "34" }
          },
          "comments": {
            "data": [
              { "type": "comments", "id": "14" }
            ]
          }
        }
      });
      expect(store.find("categories", "34").product).toBeUndefined();
      expect(store.find("comments", "14").product).toBeUndefined();
    });

    it("must not try to process inverse relationships for absent relationships", function () {
      Store.types["categories"] = {
        products: Store.hasMany({ inverse: "category" })
      };
      Store.types["products"] = {
        category: Store.hasOne({ inverse: "products" })
      };
      expect(function () {
        store.add({
          "type": "products",
          "id": "44"
        });
      }).not.toThrow();
    });

    it("must remove null (has one) inverse relationships");

    it("must remove empty (has many) inverse relationships");

  });

});
