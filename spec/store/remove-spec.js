var Store = require("../../src/store");

describe("remove", function() {

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

  it("must remove call remove for each resources of a type if no id is given", function () {
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
    spyOn(store, 'remove').and.callThrough();
    store.remove("products");
    expect(store.find("products").length).toBe(0);
    expect(store.remove).toHaveBeenCalledWith("products", "44");
    expect(store.remove).toHaveBeenCalledWith("products", "47");
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

  it("must remove dependant relationships when a resource is removed", function () {
    Store.types["categories"] = {
      products: Store.hasMany({ inverse: "category" })
    };
    Store.types["products"] = {
      category: Store.hasOne({ inverse: "products" })
    };
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
    store.remove("products", "10");
    expect(store.find("categories", "1").products).toHaveIds([ "11" ]);
    expect(store.find("categories", "1")._dependents.length).toBe(1);
    expect(store.find("categories", "1")._dependents[0]).toEqual({ type: "products", id: "11", fieldName: "category" });
    store.remove("categories", "1");
    expect(store.find("products", "11").category).toBe(null);
  });

});
