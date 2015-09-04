import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("convert must use serialize functions provided by type definitions", function (t) {
  var store = new Store();
  var serialize = sinon.spy(function (resource, data) {
    data.attributes.title = resource.title + "!";
  });
  var partial = {
    title: "Example"
  };
  t.plan(3);
  store.define("products", {
    title: {
      serialize: serialize
    }
  });
  t.deepEqual(store.convert("products", "44", partial), { type: "products", id: "44", attributes: { title: "Example!" }, relationships: {} });
  t.equal(serialize.firstCall.args[0], partial);
  t.equal(serialize.firstCall.args[2], "title");
});

test("convert must automatically extract the type and id if they're not passed", function (t) {
  var store = new Store();
  var partial = {
    type: "products",
    id: "44"
  };
  t.plan(3);
  store.define("products", {});
  t.doesNotThrow(function () {
    store.convert(partial);
  });
  t.equal(store.convert(partial).type, "products");
  t.equal(store.convert(partial).id, "44");
});

test("convert must not include the id if it wasn't provided", function (t) {
  var store = new Store();
  t.plan(3);
  store.define("products", {});
  t.equal(store.convert({ type: "products" }).id, undefined);
  t.equal(store.convert("products", {}).id, undefined);
  t.equal(store.convert("products", null, {}).id, undefined);
});
