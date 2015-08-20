var Store = require("../../../src/store");

describe("define", function () {

  var store;

  beforeEach(function () {
    store = new Store();
  });

  it("must accept pseudonyms", function () {
    store.define([ "comments", "comment" ], {
      product: Store.hasOne()
    });
    store.define([ "products", "product" ], {
      comments: Store.hasMany()
    });
    expect(store.find("comment", "67")).toBe(store.find("comments", "67"));
    expect(store.find("product", "8")).toBe(store.find("products", "8"));
    store.add({
      "type": "comments",
      "id": "1",
      "relationships": {
        "product": {
          "data": {
            "type": "products",
            "id": "1"
          }
        }
      }
    });
    expect(store.find("product", "1").comments[0]).toBe(store.find("comment", "1"));
    expect(store.find("comments", "1").product).toBe(store.find("products", "1"));
  });

  it("must throw an error if you try to define a type that has already been defined", function () {
    store.define("example", {});
    expect(function () {
      store.define([ "sample", "example"], {});
    }).toThrowError("The type 'example' has already been defined.");
  });

});
