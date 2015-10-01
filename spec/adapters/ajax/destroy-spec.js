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
    {"Content-Type": "application/vnd.api+json"},
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

test("destroy must call the error callback if an error is raised during the process", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  var callback = sinon.spy();
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("DELETE", "/foo/1", [
    204,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  store.destroy("products", "1", function () {
    throw new Error();
  }, callback);
  server.respond();
  t.equal(callback.callCount, 1);
  server.restore();
});

test("destroy must handle missing success or error callbacks", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  var callback = sinon.spy();
  var context = {};
  t.plan(5);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("DELETE", "/products/6", [
    204,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  server.respondWith("DELETE", "/products/1", [
    500,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  store.destroy("products", "6", null, callback, context);
  server.respond();
  t.equal(callback.callCount, 0);
  callback.reset();
  store.destroy("products", "6", callback, context);
  server.respond();
  t.equal(callback.callCount, 1);
  t.equal(callback.firstCall.thisValue, context);
  callback.reset();
  store.destroy("products", "1", null, callback, context);
  server.respond();
  t.equal(callback.callCount, 1);
  t.equal(callback.firstCall.thisValue, context);
  server.restore();
});

test("destroy must call callbacks with the context provided", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  var callback = sinon.spy();
  var context = {};
  t.plan(4);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("DELETE", "/products/6", [
    204,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  server.respondWith("DELETE", "/products/1", [
    500,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  store.destroy("products", "6", callback, context);
  server.respond();
  t.equal(callback.callCount, 1);
  t.equal(callback.firstCall.thisValue, context);
  callback.reset();
  store.destroy("products", "1", null, callback, context);
  server.respond();
  t.equal(callback.callCount, 1);
  t.equal(callback.firstCall.thisValue, context);
  server.restore();
});

test("destroy must throw an error if the type has not been defined", function (t) {
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.throws(function () {
    store.destroy("products", "1");
  }, /Unknown type 'products'/);
});

test("destroy must use the correct content type header", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("DELETE", "/products/6", function (request) {
    t.notEqual(request.requestHeaders["Content-Type"].split(";").indexOf("application/vnd.api+json"), -1);
  });
  store.destroy("products", "6");
  server.respond();
  server.restore();
});
