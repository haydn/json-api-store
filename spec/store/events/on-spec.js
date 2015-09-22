import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("on must fire an added event when the resource with the given type & id is added to the store", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(2);
  store.define([ "products", "product" ], {});
  store.on("added", "products", "1", listener, context);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
  t.ok(listener.calledOn(context), "should be called on context given");
});

test("on must fire an added event when the resource with the given type is added to the store", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(2);
  store.define([ "products", "product" ], {});
  store.on("added", "products", listener, context);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
  t.ok(listener.calledOn(context), "should be called on context given");
});

test("on must fire an updated event when the resource with the given type & id is updated in the store", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(3);
  store.define([ "products", "product" ], {});
  store.on("updated", "products", "1", listener, context);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.equal(listener.callCount, 0);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
  t.ok(listener.calledOn(context), "should be called on context given");
});

test("on must fire an updated event when the resource with the given type is updated in the store", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(3);
  store.define([ "products", "product" ], {});
  store.on("updated", "products", listener, context);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.equal(listener.callCount, 0);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
  t.ok(listener.calledOn(context), "should be called on context given");
});

test("on must fire an removed event when the resource with the given type & id is removed from the store", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(3);
  store.define([ "products", "product" ], {});
  store.on("removed", "products", "1", listener, context);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.equal(listener.callCount, 0);
  store.remove("products", "1");
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
  t.ok(listener.calledOn(context), "should be called on context given");
});

test("on must fire an removed event when the resource with the given type is removed from the store", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(3);
  store.define([ "products", "product" ], {});
  store.on("removed", "products", listener, context);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.equal(listener.callCount, 0);
  store.remove("products", "1");
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
  t.ok(listener.calledOn(context), "should be called on context given");
});

test("on must not fire an added event when automatically creating a resource as the result of a find", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(1);
  store.define([ "products", "product" ], {});
  store.on("added", "products", "1", listener, context);
  store.find("products", "1");
  t.equal(listener.callCount, 0);
});

test("on must throw an error when an unknown event is passed", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(1);
  store.define([ "products", "product" ], {});
  t.throws(function () {
    store.on("foo", "products", "1", listener, context);
  }, /Unknown event 'foo'/);
});

test("on must throw an error if the type has not been defined", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(1);
  store.define([ "products", "product" ], {});
  t.throws(function () {
    store.on("added", "foo", "1", listener, context);
  }, /Unknown type 'foo'/);
});

test("on must call listeners that were added using a different pseudonym", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(2);
  store.define([ "products", "product" ], {});
  store.on("added", "product", listener, context);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.equal(listener.callCount, 1);
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
});

test("on must not add the same listener multiple times for the same type", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(2);
  store.define([ "products", "product" ], {});
  store.on("added", "products", listener, context);
  store.on("added", "products", listener);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.equal(listener.callCount, 1);
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
});

test("on must not add the same listener multiple times for the same type and id", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(2);
  store.define([ "products", "product" ], {});
  store.on("added", "products", "1", listener, context);
  store.on("added", "products", "1", listener);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.equal(listener.callCount, 1);
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
});

test("on must add the same listener multiple times if the id is different", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(3);
  store.define([ "products", "product" ], {});
  store.on("added", "products", "1", listener, context);
  store.on("added", "products", "2", listener, context);
  store.add({
    "type": "products",
    "id": "1"
  });
  store.add({
    "type": "products",
    "id": "2"
  });
  t.equal(listener.callCount, 2);
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
  t.ok(listener.calledWith(store.find("products", "2")), "called with resource");
});

test("on must not add the same listener multiple times for different pseudonyms of the same type", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  var context = {};
  t.plan(2);
  store.define([ "products", "product" ], {});
  store.on("added", "products", listener, context);
  store.on("added", "product", listener, context);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.equal(listener.callCount, 1);
  t.ok(listener.calledWith(store.find("products", "1")), "called with resource");
});
