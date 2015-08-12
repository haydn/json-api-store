var Store = require("../../src/store");

describe("add", function() {

  var store;

  beforeEach(function() {
    Store.types = {};
    store = new Store();
  });

  it("must remove a resource from the store", function () {
    Store.types["products"] = {};
    store.add({
      "type": "products",
      "id": "44"
    });
    expect(store.find("products").length).toBe(1);
    store.remove("products", "44");
    expect(store.find("products").length).toBe(0);
  });

  it("must remove all resources of the type from the store if no id is given", function () {
    Store.types["products"] = {};
    store.add({
      "type": "products",
      "id": "44"
    });
    store.add({
      "type": "products",
      "id": "47"
    });
    expect(store.find("products").length).toBe(2);
    store.remove("products");
    expect(store.find("products").length).toBe(0);
  });

  it("must throw an error when called without arguments", function () {
    expect(function () {
      store.remove();
    }).toThrowError(TypeError, "You must provide a type to remove");
  });

  it("must throw an error if the type has not been defined", function () {
    expect(function () {
      store.remove("products");
    }).toThrowError(TypeError, "Unknown type 'products'");
  });

});
