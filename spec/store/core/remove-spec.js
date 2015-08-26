var Store = require("../../../src/store");

describe("remove", function() {

  var store;

  beforeEach(function() {
    store = new Store();
  });

  it("must remove a resource from the store", function () {
    store.define("products", {});
    store.add({
      "type": "products",
      "id": "44"
    });
    expect(store.find("products").length).toBe(1);
    store.remove({ type: "products", id: "44" });
    expect(store.find("products").length).toBe(0);
  });

  // deprecated
  it("must remove call remove for each resources of a type if no id is given", function () {
    spyOn(console, "warn");
    store.define("products", {});
    store.add({
      "type": "products",
      "id": "44"
    });
    store.add({
      "type": "products",
      "id": "47"
    });
    expect(store.find("products").length).toBe(2);
    spyOn(store, 'remove').and.callThrough();
    store.remove({ type: "products" });
    expect(store.find("products").length).toBe(0);
    expect(store.remove).toHaveBeenCalledWith({ type: "products", id: "44" });
    expect(store.remove).toHaveBeenCalledWith({ type: "products", id: "47" });
  });

  it("must throw an error when called without arguments", function () {
    expect(function () {
      store.remove();
    }).toThrowError(TypeError, "You must provide a type to remove");
  });

  it("must throw an error if the type has not been defined", function () {
    expect(function () {
      store.remove({ type: "products", id: "1" });
    }).toThrowError(TypeError, "Unknown type 'products'");
  });

  it("must remove dependant relationships when a resource is removed", function () {
    store.define("categories", {
      products: Store.hasMany({ inverse: "category" })
    });
    store.define("products", {
      category: Store.hasOne({ inverse: "products" })
    });
    store.add({
      "type": "categories",
      "id": "1",
      "relationships": {
        "products": {
          "data": [
            { "type": "products", "id": "10" },
            { "type": "products", "id": "11" }
          ]
        }
      }
    });
    expect(store.find("categories", "1").products).toHaveIds([ "10", "11" ]);
    store.remove({ type: "products", id: "10" });
    expect(store.find("categories", "1").products).toHaveIds([ "11" ]);
    store.remove({ type: "categories", id: "1" });
    expect(store.find("products", "11").category).toBe(null);
  });

  it("must log a deprecation warning when using the old syntax", function () {
    spyOn(console, "warn");
    store.define("products", {});
    store.add({
      "type": "products",
      "id": "44"
    });
    store.remove("products", "44");
    expect(console.warn).toHaveBeenCalledWith("WARNING: The `store.remove(type, id)` syntax has been deprecated in favour of `store.remove({ type: type, id: id })`.");
  });

  it("must log a deprecation warning when no id is specified", function () {
    spyOn(console, "warn");
    store.define("products", {});
    store.add({
      "type": "products",
      "id": "44"
    });
    store.remove({ type: "products" });
    expect(console.warn).toHaveBeenCalledWith("WARNING: Calling `store.remove()` without an ID has been deprecated. Instead, use `store.find(type).forEach(x => store.remove(x))`.");
  });

});
