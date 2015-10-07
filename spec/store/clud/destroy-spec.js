import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("destroy must throw an error if it is called when there isn't an adapter", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.destroy();
  }, /Adapter missing\. Specify an adapter when creating the store: `var store = new Store\(adapter\);`/);
});

test("destroy must call the destroy method provided by the adapter", function (t) {
  var a = {};
  var adatper = {
    destroy: sinon.spy(function () {
      return a;
    })
  };
  var store = new Store(adatper);
  var type = "foo";
  var id = "1";
  var options = {};
  var result;
  t.plan(6);
  t.doesNotThrow(function () {
    result = store.destroy(type, id, options);
  }, "should not throw an error");
  t.equal(adatper.destroy.lastCall.args[0], store);
  t.equal(adatper.destroy.lastCall.args[1], type);
  t.equal(adatper.destroy.lastCall.args[2], id);
  t.equal(adatper.destroy.lastCall.args[3], options);
  t.equal(result, a);
});
