import test from "tape";
import Store from "../../../src/store";

test("find must, when an id is provided, return an object with 'type' and 'id' properties", function (t) {
  var store = new Store();
  t.plan(2);
  store.define("products", {});
  t.equal(store.find("products", "23").type, "products");
  t.equal(store.find("products", "74").id, "74");
});

test("find must return the same object if called with the same arguments", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("products", {});
  t.equal(store.find("products", "23"), store.find("products", "23"));
});

test("find must return an array of objects when no id is provided", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("products", {});
  store.find("products", "1");
  t.notEqual(store.find("products").indexOf(store.find("products", "1")), -1);
});

test("find must throw an error when trying to find an unknown resource type", function (t) {
  var store = new Store();
  t.plan(2);
  t.throws(function () {
    store.find("products");
  }, /Unknown type 'products'/);
  t.throws(function () {
    store.find("products", "1");
  }, /Unknown type 'products'/);
});

test("find must throw an error when called without arguments", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.find();
  }, /You must provide a type/);
});

test("find must give fields their default values", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("products", {
    title: {
      default: "example"
    }
  });
  t.equal(store.find("products", "1").title, "example");
});
