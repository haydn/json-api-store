import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("off must remove event handlers", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(2);
  store.define([ "products", "product" ], {});
  store.on("added", "products", "1", listener, context);
  store.on("added", "products", listener, context);
  store.on("updated", "products", "1", listener, context);
  store.on("updated", "products", listener, context);
  store.on("removed", "products", "1", listener, context);
  store.on("removed", "products", listener, context);
  store.add({
    "type": "products",
    "id": "1"
  });
  store.add({
    "type": "products",
    "id": "1"
  });
  store.remove("products", "1");
  t.equal(listener.callCount, 6);
  store.off("added", "products", "1", listener);
  store.off("added", "products", listener);
  store.off("updated", "products", "1", listener);
  store.off("updated", "products", listener);
  store.off("removed", "products", "1", listener);
  store.off("removed", "products", listener);
  store.add({
    "type": "products",
    "id": "1"
  });
  store.add({
    "type": "products",
    "id": "1"
  });
  store.remove("products", "1");
  t.equal(listener.callCount, 6);
});

test("off must throw an error when an unknown event is passed", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  t.plan(1);
  store.define([ "products", "product" ], {});
  t.throws(function () {
    store.off("foo", "products", "1", listener);
  }, /Unknown event 'foo'/);
});

test("off must throw an error if the type has not been defined", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  t.plan(1);
  store.define([ "products", "product" ], {});
  t.throws(function () {
    store.off("added", "foo", "1", listener);
  }, /Unknown type 'foo'/);
});

test("off must remove listeners added with a different pseudonym", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  t.plan(1);
  store.define([ "products", "product" ], {});
  store.on("added", "products", listener);
  store.off("added", "product", listener);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.equal(listener.callCount, 0);
});
