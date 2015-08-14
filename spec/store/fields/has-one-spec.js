var Store = require("../../../src/store");

describe("hasOne", function() {

  var store;

  beforeEach(function() {
    Store.types = {};
    store = new Store();
  });

  it("must return the correct type attribute", function () {
    expect(Store.hasOne().type).toBe("has-one");
    expect(Store.hasOne("example").type).toBe("has-one");
    expect(Store.hasOne({}).type).toBe("has-one");
    expect(Store.hasOne("example", {}).type).toBe("has-one");
  });

  it("must return a deserialize function that maps to the relation described in the data property", function () {
    Store.types["categories"] = {};
    Store.types["products"] = {};
    var field = Store.hasOne("category");
    var data = {
      "type": "products",
      "id": "1",
      "relationships": {
        "category": {
          "data": {
            "type": "categories",
            "id": "2"
          }
        }
      }
    };
    expect(field.deserialize.call(store, data)).toBe(store.find("categories", "2"));
  });

  it("must return a deserialize function that uses the key param when the name isn't provided", function () {
    Store.types["categories"] = {};
    Store.types["products"] = {};
    var field = Store.hasOne();
    var data = {
      "type": "products",
      "id": "1",
      "relationships": {
        "category": {
          "data": {
            "type": "categories",
            "id": "2"
          }
        }
      }
    };
    expect(field.deserialize.call(store, data, "category")).toBe(store.find("categories", "2"));
  });

  it("must return a deserialize function that returns null when the relationship data field is null", function () {
    var data = {
      "type": "products",
      "id": "1",
      "relationships": {
        "category": {
          "data": null
        }
      }
    };
    expect(Store.hasOne("category").deserialize.call(store, data)).toBeNull();
    expect(Store.hasOne().deserialize.call(store, data, "category")).toBeNull();
  });

  it("must return a deserialize function that returns undefined when the relationship data field is missing", function () {
    var data = {
      "type": "products",
      "id": "1",
      "relationships": {
        "category": {}
      }
    };
    expect(Store.hasOne("category").deserialize.call(store, data)).toBeUndefined();
    expect(Store.hasOne().deserialize.call(store, data, "category")).toBeUndefined();
  });

  it("must return a deserialize function that returns undefined when the relationship type field is missing", function () {
    var data = {
      "type": "products",
      "id": "1",
      "relationships": {}
    };
    expect(Store.hasOne("category").deserialize.call(store, data)).toBeUndefined();
    expect(Store.hasOne().deserialize.call(store, data, "category")).toBeUndefined();
  });

  it("must return a deserialize function that returns undefined when the relationship field is missing", function () {
    var data = {
      "type": "products",
      "id": "1"
    };
    expect(Store.hasOne("category").deserialize.call(store, data)).toBeUndefined();
    expect(Store.hasOne().deserialize.call(store, data, "category")).toBeUndefined();
  });

  it("must return a deserialize function that passes on an inverse option", function () {
    expect(Store.hasOne({ inverse: "foo" }).inverse).toBe("foo");
    expect(Store.hasOne("example", { inverse: "foo" }).inverse).toBe("foo");
  });

  it("must throw an error a relationship's type hasn't been defined", function () {
    Store.types["products"] = {};
    var field = Store.hasOne();
    var data = {
      "type": "products",
      "id": "44",
      "relationships": {
        "category": {
          "data": { "type": "categories", "id": "34" }
        }
      }
    };
    expect(function () {
      field.deserialize.call(store, data, "category");
    }).toThrowError("Unknown type 'categories'");
  });

});
