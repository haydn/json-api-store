import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("create must post a resource to the server and add it to the store on success", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(2);
  t.timeoutAfter(1000);
  store.define("products", {
    title: Store.attr()
  });
  server.respondWith("POST", "/products", [
    201,
    {
      "Content-Type": "application/vnd.api+json"
    },
    JSON.stringify({
      data: {
        type: "products",
        id: "9",
        attributes: {
          title: "My Book"
        }
      }
    })
  ]);
  store.create("products", { title: "My Book" }, function (product) {
    t.equal(product.title, "My Book");
    t.equal(store.find("products", "9").title, "My Book");
  });
  server.respond();
  server.restore();
});

test("create must handle 500 errors for failed attempts", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(2);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("POST", "/products", [
    500,
    { "Content-Type": "application/vnd.api+json" },
    JSON.stringify({
      data: { type: "products", id: "9" }
    })
  ]);
  t.equal(store.find("products").length, 0);
  store.create("products", {}, function () {
    t.fail("must not call the success callback");
  }, function () {
    t.equal(store.find("products").length, 0);
  });
  server.respond();
  server.restore();
});

test.skip("create must call the error callback if an undefined type is included");

test.skip("create must call the error callback if the server responds with a non-2xx code");

test.skip("create must call callbacks with the context provided");

test("create must use the adapter's 'base' config if present", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter({ base: "http://example.com" });
  var store = new Store(adapter);
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("POST", "http://example.com/products", [
    201,
    { "Content-Type": "application/vnd.api+json" },
    JSON.stringify({
      data: { type: "products", id: "9" }
    })
  ]);
  store.create("products", {}, function (product) {
    t.equal(store.find("products", "9"), product);
  });
  server.respond();
  server.restore();
});
