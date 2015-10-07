import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("update must update a resource on the server and add reflect the changes in the store on success", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(3);
  t.timeoutAfter(1000);
  store.define("products", {
    title: Store.attr()
  });
  server.respondWith("PATCH", "/products/9", function (request) {
    t.deepEqual(JSON.parse(request.requestBody), {
      data: {
        type: "products",
        id: "9",
        attributes: {
          title: "My Book!"
        },
        relationships: {}
      }
    });
    request.respond(204, { "Content-Type": "application/vnd.api+json" }, "");
  });
  store.add({
    type: "products",
    id: "9",
    attributes: {
      title: "My Book"
    }
  });
  store.update("products", "9", { title: "My Book!" }).subscribe(function (product) {
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
  store.update("products", "12", {}).subscribe(function () {
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
  store.update("products", "9", {}).subscribe(function () {
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
  store.define("products", {
    foo: {
      deserialize: function () {
        throw new Error();
      },
      serialize: function () {}
    }
  });
  server.respondWith("PATCH", "/products/1", [
    204,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  store.update("products", "1", {}).subscribe(function () {}, callback);
  server.respond();
  t.equal(callback.callCount, 1);
  server.restore();
});

test("update must use the options if they're provided", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("PATCH", "/products/1?fields[products]=title%2Cdescription&filter=foo&include=author%2Ccomments.user&page=1&sort=age%2Cname%2C-created", [
    201,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  store.update("products", "1", {}, {
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

test("update must throw an error if the type has not been defined", function (t) {
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.throws(function () {
    store.update("products", "1", {});
  }, /Unknown type 'products'/);
});

test("update must use the correct content type header", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("PATCH", "/products/4", function (request) {
    t.notEqual(request.requestHeaders["Content-Type"].split(";").indexOf("application/vnd.api+json"), -1);
  });
  store.update("products", "4", {});
  server.respond();
  server.restore();
});
