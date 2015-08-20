var Store = require("../../../src/store");

describe("add", function() {

  var store;

  beforeEach(function() {
    store = new Store();
  });

  it("must add a resource to the store", function () {
    store.define("products", {});
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
    store.define("products", {
      title: {
        deserialize: function (data, key) {
          return "Example " + data.id + " " + key;
        }
      }
    });
    store.add({
      "type": "products",
      "id": "44"
    });
    expect(store.find("products", "44").title).toBe("Example 44 title");
  });

  it("must not set fields when the deserialize function returns undefined", function () {
    store.define("products", {
      title: {
        deserialize: function (data) {
          if (data.attributes && data.attributes.title) {
            return "Example";
          }
        }
      }
    });
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
    store.define("products", {
      title: {
        deserialize: function (data) {
          if (data.attributes && data.attributes.title) {
            return "Example";
          } else {
            return null;
          }
        }
      }
    });
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
    store.define("products", {
      example: {
        deserialize: function () {
          return this;
        }
      }
    });
    store.add({
      "type": "products",
      "id": "44"
    });
    expect(store.find("products", "44").example).toBe(store);
  });

  describe("inverse relationships", function () {

    it("must setup inverse one-to-one relationships", function () {
      store.define("categories", {
        product: Store.hasOne({ inverse: "category" })
      });
      store.define("products", {
        category: Store.hasOne({ inverse: "product" })
      });
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
      store.define("categories", {
        products: Store.hasMany({ inverse: "category" })
      });
      store.define("products", {
        category: Store.hasOne({ inverse: "products" })
      });
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
      store.define("categories", {
        products: Store.hasMany({ inverse: "categories" })
      });
      store.define("products", {
        categories: Store.hasMany({ inverse: "products" })
      });
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
      store.define("categories", {
        products: Store.hasMany({ inverse: "category" })
      });
      store.define("products", {
        category: Store.hasOne({ inverse: "products" })
      });
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
      store.define("categories", {
        product: Store.attr()
      });
      store.define("comments", {
        product: Store.attr()
      });
      store.define("products", {
        category: Store.hasOne({ inverse: "product" }),
        comments: Store.hasMany({ inverse: "product" }),
      });
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

    it("must throw an error when an explict inverse relationship is absent", function () {
      store.define("categories", {});
      store.define("comments", {});
      store.define("products", {
        category: Store.hasOne({ inverse: "product" }),
        comments: Store.hasMany({ inverse: "products" }),
        users:    Store.hasMany()
      });
      store.define("users", {});
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
      }).toThrowError("The the inverse relationship for 'category' is missing ('product')");
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
      }).toThrowError("The the inverse relationship for 'comments' is missing ('products')");
      expect(function () {
        store.add({
          "type": "products",
          "id": "44",
          "relationships": {
            "users": {
              "data": [
                { "type": "users", "id": "6" }
              ]
            }
          }
        });
      }).not.toThrow();
    });

    it("must not try to process inverse relationships for absent relationships", function () {
      store.define("categories", {
        products: Store.hasMany({ inverse: "category" })
      });
      store.define("products", {
        category: Store.hasOne({ inverse: "products" })
      });
      expect(function () {
        store.add({
          "type": "products",
          "id": "44"
        });
      }).not.toThrow();
    });

    it("must remove null (has one) inverse relationships", function () {
      store.define("categories", {
        products: Store.hasMany({ inverse: "category" })
      });
      store.define("products", {
        category: Store.hasOne({ inverse: "products" })
      });
      store.add({
        "type": "products",
        "id": "44",
        "relationships": {
          "category": {
            "data": { "type": "categories", "id": "34" }
          }
        }
      });
      expect(store.find("categories", "34").products).toHaveIds([ "44" ]);
      store.add({
        "type": "products",
        "id": "44",
        "relationships": {
          "category": {
            "data": null
          }
        }
      });
      expect(store.find("categories", "34").products).toEqual([]);
    });

    it("must remove empty (has many) inverse relationships", function () {
      store.define("categories", {
        products: Store.hasMany({ inverse: "category" })
      });
      store.define("products", {
        category: Store.hasOne({ inverse: "products" })
      });
      store.add({
        "type": "categories",
        "id": "37",
        "relationships": {
          "products": {
            "data": [
              { "type": "products", "id": "23" },
              { "type": "products", "id": "45" }
            ]
          }
        }
      });
      expect(store.find("products", "23").category).toBe(store.find("categories", "37"));
      expect(store.find("products", "45").category).toBe(store.find("categories", "37"));
      store.add({
        "type": "categories",
        "id": "37",
        "relationships": {
          "products": {
            "data": [
              { "type": "products", "id": "23" }
            ]
          }
        }
      });
      expect(store.find("products", "45").category).toBe(null);
    });

    it("must use the type's name as a fallback for relationship names when adding resources", function () {
      store.define("categories", {
        products: Store.hasMany()
      });
      store.define("products", {
        categories: Store.hasMany()
      });
      store.add({
        "type": "categories",
        "id": "37",
        "relationships": {
          "products": {
            "data": [
              { "type": "products", "id": "23" }
            ]
          }
        }
      });
      expect(store.find("categories", "37").products).toHaveIds([ "23" ]);
      expect(store.find("products", "23").categories).toHaveIds([ "37" ]);
    });

  });

});
