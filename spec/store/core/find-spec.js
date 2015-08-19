var Store = require("../../../src/store");

describe("find", function() {

  var store;

  beforeEach(function() {
    store = new Store();
  });

  it("must, when an id is provided, return an object with 'type' and 'id' properties", function () {
    store.define("products", {});
    expect(store.find("products", "23").type).toBe("products");
    expect(store.find("products", "74").id).toBe("74");
  });

  it("must return the same object if called with the same arguments", function () {
    store.define("products", {});
    expect(store.find("products", "23")).toBe(store.find("products", "23"));
  });

  it("must return an array of objects when no id is provided", function () {
    store.define("products", {});
    store.find("products", "1");
    expect(store.find("products")).toContain(store.find("products", "1"));
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

  it("must give fields their default values", function () {
    store.define("products", {
      title: {
        default: "example"
      }
    });
    expect(store.find("products", "1").title).toBe("example");
  });

});
