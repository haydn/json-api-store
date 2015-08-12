var Store = require("../../src/store");

describe("hasMany", function() {

  var store;

  beforeEach(function() {
    Store.types = {};
    store = new Store();
  });

  it("must return the correct type attribute", function () {
    expect(Store.hasMany().type).toBe("has-many");
    expect(Store.hasMany("example").type).toBe("has-many");
    expect(Store.hasMany({}).type).toBe("has-many");
    expect(Store.hasMany("example", {}).type).toBe("has-many");
  });

  it("must return default value as an empty array", function () {
    expect(Store.hasMany().default).toEqual([]);
  });

  it("must return a deserialize function that maps to the relation described in the data property", function () {
    Store.types["categories"] = {};
    Store.types["products"] = {};
    var field = Store.hasMany("categories");
    var data = {
      "type": "products",
      "id": "1",
      "relationships": {
        "categories": {
          "data": [
            {
              "type": "categories",
              "id": "2"
            },
            {
              "type": "categories",
              "id": "4"
            }
          ]
        }
      }
    };
    expect(field.deserialize.call(store, data).length).toBe(2);
    var ids = field.deserialize.call(store, data).map(function (category) {
      return category.id;
    });
    expect(ids).toContain("2");
    expect(ids).toContain("4");
  });

  it("must return a deserialize function that uses the key param when the name isn't provided", function () {
    Store.types["categories"] = {};
    Store.types["products"] = {};
    var field = Store.hasMany();
    var data = {
      "type": "products",
      "id": "1",
      "relationships": {
        "categories": {
          "data": [
            {
              "type": "categories",
              "id": "2"
            },
            {
              "type": "categories",
              "id": "4"
            }
          ]
        }
      }
    };
    expect(field.deserialize.call(store, data, "categories").length).toBe(2);
    var ids = field.deserialize.call(store, data, "categories").map(function (category) {
      return category.id;
    });
    expect(ids).toContain("2");
    expect(ids).toContain("4");
  });

  it("must return a deserialize function that returns undefined when the relationship data field is missing", function () {
    var data = {
      "type": "products",
      "id": "1",
      "relationships": {
        "categories": {}
      }
    };
    expect(Store.hasMany("categories").deserialize.call(store, data)).toBeUndefined();
    expect(Store.hasMany().deserialize.call(store, data, "categories")).toBeUndefined();
  });

  it("must return a deserialize function that returns undefined when the relationship type field is missing", function () {
    var data = {
      "type": "products",
      "id": "1",
      "relationships": {}
    };
    expect(Store.hasMany("categories").deserialize.call(store, data)).toBeUndefined();
    expect(Store.hasMany().deserialize.call(store, data, "categories")).toBeUndefined();
  });

  it("must return a deserialize function that returns undefined when the relationship field is missing", function () {
    var data = {
      "type": "products",
      "id": "1"
    };
    expect(Store.hasMany("categories").deserialize.call(store, data)).toBeUndefined();
    expect(Store.hasMany().deserialize.call(store, data, "categories")).toBeUndefined();
  });

  it("must return a deserialize function that passes on an inverse option", function () {
    expect(Store.hasMany({ inverse: "foo" }).inverse).toBe("foo");
    expect(Store.hasMany("example", { inverse: "foo" }).inverse).toBe("foo");
  });

});
