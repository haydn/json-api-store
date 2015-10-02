import test from "tape-catch";
import Store from "../../../src/store";

test("hasMany must return the correct type attribute", function (t) {
  t.plan(4);
  t.equal(Store.hasMany().type, "has-many");
  t.equal(Store.hasMany("example").type, "has-many");
  t.equal(Store.hasMany({}).type, "has-many");
  t.equal(Store.hasMany("example", {}).type, "has-many");
});

test("hasMany must return default value as an empty array", function (t) {
  t.plan(1);
  t.deepEqual(Store.hasMany().default, []);
});

test("hasMany must return a serialize function that maps a relationship to data", function (t) {
  var store = new Store();
  var field = Store.hasMany();
  var resource = {
    type: "products",
    id: "1",
    categories: [
      {
        type: "categories",
        id: "2"
      },
      {
        type: "categories",
        id: "4"
      }
    ]
  };
  var data = {
    "relationships": {}
  };
  t.plan(1);
  store.define("categories", {});
  store.define("products", {});
  field.serialize.call(store, resource, data, "categories");
  t.deepEqual(data, {
    relationships: {
      categories: {
        data: [
          {
            type: "categories",
            id: "2"
          },
          {
            type: "categories",
            id: "4"
          }
        ]
      }
    }
  });
});

test("hasMany must return a serialize function that skips missing relationships", function (t) {
  var store = new Store();
  var field = Store.hasMany();
  var resource = {
    type: "products",
    id: "1"
  };
  var data = {
    "relationships": {}
  };
  t.plan(1);
  store.define("categories", {});
  store.define("products", {});
  field.serialize.call(store, resource, data, "categories");
  t.deepEqual(data, {
    relationships: {}
  });
});

// TODO: serialize function uses the name option if it's provided

test("hasMany must return a serialize function that uses the name option if it's provided", function (t) {
  var store = new Store();
  var field = Store.hasMany("categories-x");
  var resource = {
    type: "products",
    id: "1",
    categories: [
      {
        type: "categories",
        id: "2"
      },
      {
        type: "categories",
        id: "4"
      }
    ]
  };
  var data = {
    "relationships": {}
  };
  t.plan(1);
  store.define("categories", {});
  store.define("products", {});
  field.serialize.call(store, resource, data, "categories");
  t.deepEqual(data, {
    relationships: {
      "categories-x": {
        data: [
          {
            type: "categories",
            id: "2"
          },
          {
            type: "categories",
            id: "4"
          }
        ]
      }
    }
  });
});

test("hasMany must return a deserialize function that maps to the relation described in the data property", function (t) {
  var store = new Store();
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
  t.plan(2);
  store.define("categories", {});
  store.define("products", {});
  t.equal(field.deserialize.call(store, data).length, 2);
  t.deepEqual(field.deserialize.call(store, data).map(c => c.id).sort(), [ "2", "4" ]);
});

test("hasMany must return a deserialize function that uses the key param when the name isn't provided", function (t) {
  var store = new Store();
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
  t.plan(2);
  store.define("categories", {});
  store.define("products", {});
  t.equal(field.deserialize.call(store, data, "categories").length, 2);
  t.deepEqual(field.deserialize.call(store, data, "categories").map(c => c.id).sort(), [ "2", "4" ]);
});

test("hasMany must return a deserialize function that returns an empty array when the relationship data field is null or an empty array", function (t) {
  var store = new Store();
  var data = {
    "type": "products",
    "id": "1",
    "relationships": {
      "categories": {
        "data": []
      },
      "comments": {
        "data": null
      }
    }
  };
  t.plan(4);
  t.deepEqual(Store.hasMany("categories").deserialize.call(store, data), []);
  t.deepEqual(Store.hasMany().deserialize.call(store, data, "categories"), []);
  t.deepEqual(Store.hasMany("comments").deserialize.call(store, data), []);
  t.deepEqual(Store.hasMany().deserialize.call(store, data, "comments"), []);
});

test("hasMany must return a deserialize function that returns undefined when the relationship data field is missing", function (t) {
  var store = new Store();
  var data = {
    "type": "products",
    "id": "1",
    "relationships": {
      "categories": {}
    }
  };
  t.plan(2);
  t.equal(Store.hasMany("categories").deserialize.call(store, data), undefined);
  t.equal(Store.hasMany().deserialize.call(store, data, "categories"), undefined);
});

test("hasMany must return a deserialize function that returns undefined when the relationship type field is missing", function (t) {
  var store = new Store();
  var data = {
    "type": "products",
    "id": "1",
    "relationships": {}
  };
  t.plan(2);
  t.equal(Store.hasMany("categories").deserialize.call(store, data), undefined);
  t.equal(Store.hasMany().deserialize.call(store, data, "categories"), undefined);
});

test("hasMany must return a deserialize function that returns undefined when the relationship field is missing", function (t) {
  var store = new Store();
  var data = {
    "type": "products",
    "id": "1"
  };
  t.plan(2);
  t.equal(Store.hasMany("categories").deserialize.call(store, data), undefined);
  t.equal(Store.hasMany().deserialize.call(store, data, "categories"), undefined);
});

test("hasMany must return a deserialize function that passes on an inverse option", function (t) {
  t.plan(2);
  t.equal(Store.hasMany({ inverse: "foo" }).inverse, "foo");
  t.equal(Store.hasMany("example", { inverse: "foo" }).inverse, "foo");
});

test("hasMany must throw an error a relationship's type hasn't been defined", function (t) {
  var store = new Store();
  var field = Store.hasMany();
  var data = {
    "type": "products",
    "id": "44",
    "relationships": {
      "categories": {
        "data": [
          { "type": "categories", "id": "34" }
        ]
      }
    }
  };
  t.plan(1);
  store.define("products", {});
  t.throws(function () {
    field.deserialize.call(store, data, "categories");
  }, /Unknown type 'categories'/);
});
