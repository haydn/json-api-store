import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("remove must remove a resource from the store", function (t) {
  var store = new Store();
  t.plan(2);
  store.define("products", {});
  store.add({
    "type": "products",
    "id": "44"
  });
  t.equal(store.find("products").length, 1);
  store.remove("products", "44");
  t.equal(store.find("products").length, 0);
});

test("remove must remove call remove for each resources of a type if no id is given", function (t) {
  var store = new Store();
  t.plan(4);
  store.define("products", {});
  store.add({
    "type": "products",
    "id": "44"
  });
  store.add({
    "type": "products",
    "id": "47"
  });
  t.equal(store.find("products").length, 2);
  sinon.spy(store, "remove");
  store.remove("products");
  t.equal(store.find("products").length, 0);
  t.ok(store.remove.calledWith("products", "44"));
  t.ok(store.remove.calledWith("products", "47"));
});

test("remove must throw an error when called without arguments", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.remove();
  }, /You must provide a type to remove/);
});

test("remove must throw an error if the type has not been defined", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.remove("products");
  }, /Unknown type 'products'/);
});

test("remove must not throw an error if the a resource doesn't exist", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("products", {});
  t.doesNotThrow(function () {
    store.remove("products", "1");
  });
});

test("remove must remove dependant relationships when a resource is removed", function (t) {
  var store = new Store();
  t.plan(3);
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
  t.deepEqual(store.find("categories", "1").products.map(x => x.id).sort(), [ "10", "11" ]);
  store.remove("products", "10");
  t.deepEqual(store.find("categories", "1").products.map(x => x.id).sort(), [ "11" ]);
  store.remove("categories", "1");
  t.equal(store.find("products", "11").category, null);
});
