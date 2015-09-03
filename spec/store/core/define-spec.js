import test from "tape-catch";
import Store from "../../../src/store";

test("define must accept pseudonyms", function (t) {
  var store = new Store();
  t.plan(4);
  store.define([ "comments", "comment" ], {
    product: Store.hasOne()
  });
  store.define([ "products", "product" ], {
    comments: Store.hasMany()
  });
  t.equal(store.find("comment", "67"), store.find("comments", "67"));
  t.equal(store.find("product", "8"), store.find("products", "8"));
  store.add({
    "type": "comments",
    "id": "1",
    "relationships": {
      "product": {
        "data": {
          "type": "products",
          "id": "1"
        }
      }
    }
  });
  t.equal(store.find("product", "1").comments[0], store.find("comment", "1"));
  t.equal(store.find("comments", "1").product, store.find("products", "1"));
});

test("define must throw an error if you try to define a type that has already been defined", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("example", {});
  t.throws(function () {
    store.define([ "sample", "example"], {});
  }, /The type 'example' has already been defined\./);
});

test("define must throw an error if you try to define a type that without providing a definition", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.define("example");
  }, /You must provide a definition for the type 'example'\./);
});
