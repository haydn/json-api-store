import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("update must throw an error if update is called when there isn't an adapter", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.update();
  }, /Adapter missing\. Specify an adapter when creating the store: `var store = new Store\(adapter\);`/);
});

test("update must call the update method prodvided by the adapter", function (t) {
  var adatper = { update: sinon.spy() };
  var store = new Store(adatper);
  var a = {};
  var cb = function () {};
  t.plan(2);
  t.doesNotThrow(function () {
    store.update("foo", "1", a, cb);
  }, "should not throw an error");
  t.ok(adatper.update.calledWith(store, "foo", "1", a, cb), "should call adapter with the same params");
});
