import test from "tape";
import Store from "../../../src/store";

test("update must throw an error if update is called when there isn't an adapter", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.update();
  }, /Adapter missing\. Specify an adapter when creating the store: `var store = new Store\(adapter\);`/);
});
