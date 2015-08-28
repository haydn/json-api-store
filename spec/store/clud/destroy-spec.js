import test from "tape";
import sinon from "sinon";
import Store from "../../../src/store";

test("destroy must throw an error if it is called when there isn't an adapter", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.destroy();
  }, /Adapter missing\. Specify an adapter when creating the store: `var store = new Store\(adapter\);`/);
});

test("destroy must call the destroy method prodvided by the adapter", function (t) {
  var adatper = { destroy: sinon.spy() };
  var store = new Store(adatper);
  var cb = function () {};
  t.plan(2);
  t.doesNotThrow(function () {
    store.destroy("foo", "1", cb);
  }, "should not throw an error");
  t.ok(adatper.destroy.calledWith(store, "foo", "1", cb), "should call adapter with the same params");
});