import test from "tape";
import Store from "../../../src/store";

test("hasOne must return the correct type attribute", function (t) {
  t.plan(4);
  t.equal(Store.hasOne().type, "has-one");
  t.equal(Store.hasOne("example").type, "has-one");
  t.equal(Store.hasOne({}).type, "has-one");
  t.equal(Store.hasOne("example", {}).type, "has-one");
});

test("hasOne must return a deserialize function that maps to the relation described in the data property", function (t) {
  var store = new Store();
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
  t.plan(1);
  store.define("categories", {});
  store.define("products", {});
  t.equal(field.deserialize.call(store, data), store.find("categories", "2"));
});

test("hasOne must return a deserialize function that uses the key param when the name isn't provided", function (t) {
  var store = new Store();
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
  t.plan(1);
  store.define("categories", {});
  store.define("products", {});
  t.equal(field.deserialize.call(store, data, "category"), store.find("categories", "2"));
});

test("hasOne must return a deserialize function that returns null when the relationship data field is null", function (t) {
  var store = new Store();
  var data = {
    "type": "products",
    "id": "1",
    "relationships": {
      "category": {
        "data": null
      }
    }
  };
  t.plan(2);
  t.equal(Store.hasOne("category").deserialize.call(store, data), null);
  t.equal(Store.hasOne().deserialize.call(store, data, "category"), null);
});

test("hasOne must return a deserialize function that returns undefined when the relationship data field is missing", function (t) {
  var store = new Store();
  var data = {
    "type": "products",
    "id": "1",
    "relationships": {
      "category": {}
    }
  };
  t.plan(2);
  t.equal(Store.hasOne("category").deserialize.call(store, data), undefined);
  t.equal(Store.hasOne().deserialize.call(store, data, "category"), undefined);
});

test("hasOne must return a deserialize function that returns undefined when the relationship type field is missing", function (t) {
  var store = new Store();
  var data = {
    "type": "products",
    "id": "1",
    "relationships": {}
  };
  t.plan(2);
  t.equal(Store.hasOne("category").deserialize.call(store, data), undefined);
  t.equal(Store.hasOne().deserialize.call(store, data, "category"), undefined);
});

test("hasOne must return a deserialize function that returns undefined when the relationship field is missing", function (t) {
  var store = new Store();
  var data = {
    "type": "products",
    "id": "1"
  };
  t.plan(2);
  t.equal(Store.hasOne("category").deserialize.call(store, data), undefined);
  t.equal(Store.hasOne().deserialize.call(store, data, "category"), undefined);
});

test("hasOne must return a deserialize function that passes on an inverse option", function (t) {
  t.plan(2);
  t.equal(Store.hasOne({ inverse: "foo" }).inverse, "foo");
  t.equal(Store.hasOne("example", { inverse: "foo" }).inverse, "foo");
});

test("hasOne must throw an error a relationship's type hasn't been defined", function (t) {
  var store = new Store();
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
  t.plan(1);
  store.define("products", {});
  t.throws(function () {
    field.deserialize.call(store, data, "category");
  }, /Unknown type 'categories'/);
});
