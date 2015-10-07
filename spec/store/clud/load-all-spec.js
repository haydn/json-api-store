import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("loadAll must throw an error if it is called when there isn't an adapter", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.loadAll();
  }, /Adapter missing\. Specify an adapter when creating the store: `var store = new Store\(adapter\);`/);
});

test("loadAll must call the load method provided by the adapter", function (t) {
  var a = {};
  var adatper = {
    load: sinon.spy(function () {
      return a;
    })
  };
  var store = new Store(adatper);
  var type = "foo";
  var options = {};
  var result;
  t.plan(6);
  t.doesNotThrow(function () {
    result = store.loadAll(type, options);
  }, "should not throw an error");
  t.equal(adatper.load.lastCall.args[0], store);
  t.equal(adatper.load.lastCall.args[1], type);
  t.equal(adatper.load.lastCall.args[2], null);
  t.equal(adatper.load.lastCall.args[3], options);
  t.equal(result, a);
});
