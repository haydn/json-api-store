import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("destroy must delete a resource from the server and remove it from the store on success", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(2);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("DELETE", "/products/6", [
    204,
    {
      "Content-Type": "application/vnd.api+json"
    },
    ""
  ]);
  store.add({
    type: "products",
    id: "6"
  });
  t.equal(store.find("products").length, 1);
  store.destroy("products", "6", function () {
    t.equal(store.find("products").length, 0);
  });
  server.respond();
  server.restore();
});

test("destroy must handle 500 errors for failed attempts", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(2);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("DELETE", "/products/6", [
    500,
    {
      "Content-Type": "application/vnd.api+json"
    },
    ""
  ]);
  store.add({
    type: "products",
    id: "6"
  });
  t.equal(store.find("products").length, 1);
  store.destroy("products", "6", function () {
    t.fail("must not call the success callback");
  }, function () {
    t.equal(store.find("products").length, 1);
  });
  server.respond();
  server.restore();
});

test("destroy must use the adapter's 'base' config if present", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter({ base: "http://example.com" });
  var store = new Store(adapter);
  t.plan(2);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("DELETE", "http://example.com/products/2", [
    204,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  store.add({ type: "products", id: "2" });
  t.equal(store.find("products").length, 1);
  store.destroy("products", "2", function () {
    t.equal(store.find("products").length, 0);
  });
  server.respond();
  server.restore();
});

test.skip("destroy must call callbacks with the context provided");
