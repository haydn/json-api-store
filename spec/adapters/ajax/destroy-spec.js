import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("destroy must delete a resource from the server and remove it from the store on success", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(3);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("DELETE", "/products/6", function (request) {
    t.false(request.requestBody);
    request.respond(204, { "Content-Type": "application/vnd.api+json" }, "");
  });
  store.add({
    type: "products",
    id: "6"
  });
  t.equal(store.find("products").length, 1);
  store.destroy("products", "6").subscribe(function () {
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
  store.destroy("products", "6").subscribe(function () {
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
  store.destroy("products", "2").subscribe(function () {
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
  store.destroy("products", "1").subscribe(function () {
    throw new Error();
  }, callback);
  server.respond();
  t.equal(callback.callCount, 1);
  server.restore();
});

test("destroy must use the options if they're provided", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("DELETE", "/products/1?fields[products]=title%2Cdescription&filter=foo&include=author%2Ccomments.user&page=1&sort=age%2Cname%2C-created", [
    204,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  store.destroy("products", "1", {
    include: "author,comments.user",
    fields: {
      products: "title,description"
    },
    sort: "age,name,-created",
    page: 1,
    filter: "foo"
  }).subscribe(function (product) {
    t.pass("returns a successful response");
  }, function (error) {
    t.fail(error);
  });
  server.respond();
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
