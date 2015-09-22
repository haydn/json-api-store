import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("update must update a resource on the server and add reflect the changes in the store on success", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(2);
  t.timeoutAfter(1000);
  store.define("products", {
    title: Store.attr()
  });
  server.respondWith("PATCH", "/products/9", [
    204,
    {
      "Content-Type": "application/vnd.api+json"
    },
    ""
  ]);
  store.add({
    type: "products",
    id: "9",
    attributes: {
      title: "My Book"
    }
  });
  store.update("products", "9", { title: "My Book!" }, function (product) {
    t.equal(product.title, "My Book!");
    t.equal(store.find("products", "9").title, "My Book!");
  });
  server.respond();
  server.restore();
});

test("update must handle 500 errors for failed attempts", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(2);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("PATCH", "/products/12", [
    500,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  t.equal(store.find("products").length, 0);
  store.update("products", "12", {}, function () {
    t.fail("must not call the success callback");
  }, function () {
    t.equal(store.find("products").length, 0);
  });
  server.respond();
  server.restore();
});

test("update must use the adapter's 'base' config if present", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter({ base: "http://example.com" });
  var store = new Store(adapter);
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("PATCH", "http://example.com/products/9", [
    204,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  store.add({ type: "products", id: "9" });
  store.update("products", "9", {}, function () {
    t.pass("should call success callback");
  });
  server.respond();
  server.restore();
});

test("update must call the error callback if an error is raised during the process", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  var callback = sinon.spy();
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("PATCH", "/products/1", [
    204,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  store.update("products", "1", {}, function () { throw new Error(); }, callback);
  server.respond();
  t.equal(callback.callCount, 1);
  server.restore();
});

test.skip("update must handle missing success or error callbacks", function (t) {});

test.skip("update must call callbacks with the context provided", function (t) {});

test.skip("update must throw an error if the type has not been defined", function (t) {});
