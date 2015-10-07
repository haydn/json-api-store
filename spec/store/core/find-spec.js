import test from "tape-catch";
import Store from "../../../src/store";

test("find must return an object with 'type' and 'id' properties", function (t) {
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

test("find must throw an error when trying to find an unknown resource type", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.find("products", "1");
  }, /Unknown type 'products'/);
});

test("find must throw an error when called without a type", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.find();
  }, /You must provide a type/);
});

// test("find must throw an error when called without an id", function (t) {
//   var store = new Store();
//   store.define("products", {});
//   t.plan(1);
//   t.throws(function () {
//     store.find("products");
//   }, /You must provide an id/);
// });

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
