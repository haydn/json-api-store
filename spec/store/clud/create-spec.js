import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("create must throw an error if it is called when there isn't an adapter", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.create();
  }, /Adapter missing\. Specify an adapter when creating the store: `var store = new Store\(adapter\);`/);
});

test("create must call the create method prodvided by the adapter", function (t) {
  var adatper = { create: sinon.spy() };
  var store = new Store(adatper);
  var type = "foo";
  var partial = {};
  var options = {};
  var success = function () {};
  var error = function () {};
  var context = {};
  t.plan(2);
  t.doesNotThrow(function () {
    store.create(type, partial, options, success, error, context);
  }, "should not throw an error");
  t.ok(adatper.create.calledWith(store, type, partial, options, success, error, context), "should call adapter with the same params");
});
