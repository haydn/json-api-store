var Store = require("../../src/store");

describe("find", function() {

  var store;

  beforeEach(function() {
    Store.types = {};
    store = new Store();
  });

  it("must return an object with type and id fields when an id is provided", function () {
    Store.types["products"] = {};
    expect(store.find("products", "23").type).toBe("products");
    expect(store.find("products", "74").id).toBe("74");
  });

  it("must return the same object if called with the same arguments", function () {
    Store.types["products"] = {};
    expect(store.find("products", "23")).toBe(store.find("products", "23"));
  });

  it("must return an array of objects when no id is provided", function () {
    Store.types["products"] = {};
    var a = store.find("products", "1");
    expect(store.find("products")).toContain(a);
  });

  it("must throw an error when trying to find an unknown resource type", function () {
    expect(function () {
      store.find("products");
    }).toThrowError(TypeError, "Unknown type 'products'");
    expect(function () {
      store.find("products", "1");
    }).toThrowError(TypeError, "Unknown type 'products'");
  });

  it("must throw an error when called without arguments", function () {
    expect(function () {
      store.find();
    }).toThrowError(TypeError, "You must provide a type");
  });

});
