var Store = require("../../src/store");

describe("attr", function() {

  var store;

  beforeEach(function() {
    Store.types = {};
    store = new Store();
  });

  it("must return the correct type attribute", function () {
    expect(Store.attr().type).toBe("attr");
  });

  it("must return a deserialize function that passes on a default option", function () {
    expect(Store.attr({ default: "foo" }).default).toBe("foo");
    expect(Store.attr("example", { default: "foo" }).default).toBe("foo");
  });

  it("must return a deserialize function that maps to the attribute provided", function () {
    var field = Store.attr("example-title");
    var data = {
      "type": "products",
      "id": "1",
      "attributes": {
        "example-title": "Example"
      }
    };
    expect(field.deserialize.call(this, data)).toBe("Example");
  });

  it("must return a deserialize function that maps to the key if no attribute name is provided", function () {
    var field = Store.attr();
    var data = {
      "type": "products",
      "id": "1",
      "attributes": {
        "title": "Example"
      }
    };
    expect(field.deserialize.call(store, data, "title")).toBe("Example");
  });

  it("must return undefined when the attribute is missing from the data", function () {
    var field = Store.attr("title");
    expect(field.deserialize.call(store, {
      "type": "products",
      "id": "1",
      "attributes": {}
    }, "title")).toBeUndefined();
    expect(field.deserialize.call(store, {
      "type": "products",
      "id": "1"
    }, "title")).toBeUndefined();
  });

});
