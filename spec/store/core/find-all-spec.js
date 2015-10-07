import test from "tape-catch";
import Store from "../../../src/store";

test("find must return an array of objects", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("products", {});
  store.add({ type: "products", id: "1" });
  t.notEqual(store.findAll("products").indexOf(store.find("products", "1")), -1);
});

test("find must throw an error when trying to find an unknown resource type", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.findAll("products");
  }, /Unknown type 'products'/);
});

test("find must throw an error when called without a type", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.find();
  }, /You must provide a type/);
});
