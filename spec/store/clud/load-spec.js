import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("load must throw an error if it is called when there isn't an adapter", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.load();
  }, /Adapter missing\. Specify an adapter when creating the store: `var store = new Store\(adapter\);`/);
});

test("load must call the load method prodvided by the adapter", function (t) {
  var adatper = { load: sinon.spy() };
  var store = new Store(adatper);
  var type = "foo";
  var id = "1";
  var options = {};
  var success = function () {};
  var error = function () {};
  var context = {};
  t.plan(2);
  t.doesNotThrow(function () {
    store.load(type, id, options, success, error, context);
  }, "should not throw an error");
  t.ok(adatper.load.calledWith(store, type, id, options, success, error, context), "should call adapter with the same params");
});
