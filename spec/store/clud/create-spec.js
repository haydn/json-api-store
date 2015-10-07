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

test("create must call the create method provided by the adapter", function (t) {
  var a = {};
  var adatper = {
    create: sinon.spy(function () {
      return a;
    })
  };
  var store = new Store(adatper);
  var type = "foo";
  var partial = {};
  var options = {};
  var result;
  t.plan(6);
  t.doesNotThrow(function () {
    result = store.create(type, partial, options);
  }, "should not throw an error");
  t.equal(adatper.create.lastCall.args[0], store);
  t.equal(adatper.create.lastCall.args[1], type);
  t.equal(adatper.create.lastCall.args[2], partial);
  t.equal(adatper.create.lastCall.args[3], options);
  t.equal(result, a);
});
