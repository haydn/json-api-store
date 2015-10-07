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

test("update must call the update method provided by the adapter", function (t) {
  var a = {};
  var adatper = {
    update: sinon.spy(function () {
      return a;
    })
  };
  var store = new Store(adatper);
  var type = "foo";
  var id = "1";
  var partial = {};
  var options = {};
  var result;
  t.plan(7);
  t.doesNotThrow(function () {
    result = store.update(type, id, partial, options);
  }, "should not throw an error");
  t.equal(adatper.update.lastCall.args[0], store);
  t.equal(adatper.update.lastCall.args[1], type);
  t.equal(adatper.update.lastCall.args[2], id);
  t.equal(adatper.update.lastCall.args[3], partial);
  t.equal(adatper.update.lastCall.args[4], options);
  t.equal(result, a);
});
