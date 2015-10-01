import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("observable must fire an added event when a resource is added to the store", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  t.plan(5);
  store.define("products", {});
  store.observable.subscribe(listener);
  store.add({
    "type": "products",
    "id": "1"
  });
  t.equal(listener.callCount, 1);
  t.equal(listener.firstCall.args[0].name, "added");
  t.equal(listener.firstCall.args[0].type, "products");
  t.equal(listener.firstCall.args[0].id, "1");
  t.equal(listener.firstCall.args[0].resource, store.find("products", "1"));
});

test("observable must fire an updated event when a resource is update in the store", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  t.plan(5);
  store.define("products", {
    title: Store.attr()
  });
  store.add({
    "type": "products",
    "id": "1",
    "attributes": {
      "title": "foo"
    }
  });
  store.observable.subscribe(listener);
  store.add({
    "type": "products",
    "id": "1",
    "attributes": {
      "title": "bar"
    }
  });
  t.equal(listener.callCount, 1);
  t.equal(listener.firstCall.args[0].name, "updated");
  t.equal(listener.firstCall.args[0].type, "products");
  t.equal(listener.firstCall.args[0].id, "1");
  t.equal(listener.firstCall.args[0].resource, store.find("products", "1"));
});

test("observable must fire a removed event when a resource is removed from the store", function (t) {
  var store = new Store();
  var listener = sinon.spy();
  t.plan(5);
  store.define("products", {
    title: Store.attr()
  });
  store.add({
    "type": "products",
    "id": "1",
    "attributes": {
      "title": "foo"
    }
  });
  store.observable.subscribe(listener);
  store.remove("products", "1");
  t.equal(listener.callCount, 1);
  t.equal(listener.firstCall.args[0].name, "removed");
  t.equal(listener.firstCall.args[0].type, "products");
  t.equal(listener.firstCall.args[0].id, "1");
  t.equal(listener.firstCall.args[0].resource, null);
});
