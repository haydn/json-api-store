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
  var type = "foo";
  var id = "1";
  var partial = {};
  var options = {};
  var success = function () {};
  var error = function () {};
  var context = {};
  t.plan(2);
  t.doesNotThrow(function () {
    store.update(type, id, partial, options, success, error, context);
  }, "should not throw an error");
  t.ok(adatper.update.calledWith(store, type, id, partial, options, success, error, context), "should call adapter with the same params");
});
