import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("create must post a resource to the server and add it to the store on success", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(3);
  t.timeoutAfter(1000);
  store.define("products", {
    title: Store.attr()
  });
  server.respondWith("POST", "/products", function (request) {
    t.deepEqual(JSON.parse(request.requestBody), {
      data: {
        type: "products",
        attributes: {
          title: "My Book"
        },
        relationships: {}
      }
    });
    var data = {
      data: {
        type: "products",
        id: "9",
        attributes: {
          title: "My Book"
        }
      }
    };
    request.respond(201, { "Content-Type": "application/vnd.api+json" }, JSON.stringify(data));
  });
  store.create("products", { title: "My Book" }).subscribe(function (product) {
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
    ""
  ]);
  t.equal(store.find("products").length, 0);
  store.create("products", {}).subscribe(function () {
    t.fail("must not call the success callback");
  }, function () {
    t.equal(store.find("products").length, 0);
  });
  server.respond();
  server.restore();
});

test("create must call the error callback if an error is raised during the process", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  var callback = sinon.spy();
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("POST", "/products", [
    201,
    {
      "Content-Type": "application/vnd.api+json"
    },
    JSON.stringify({
      data: {
        type: "products",
        id: "9"
      },
      included: [
        {
          type: "foo",
          id: "1"
        }
      ]
    })
  ]);
  store.create("products", {}).subscribe(function () {}, callback);
  server.respond();
  t.equal(callback.callCount, 1);
  server.restore();
});

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
  store.create("products", {}).subscribe(function (product) {
    t.equal(store.find("products", "9"), product);
  });
  server.respond();
  server.restore();
});

test("create must use the options if they're provided", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("POST", "/products?fields[products]=title%2Cdescription&filter=foo&include=author%2Ccomments.user&page=1&sort=age%2Cname%2C-created", [
    201,
    { "Content-Type": "application/vnd.api+json" },
    JSON.stringify({
      data: { type: "products", id: "9" },
      included: []
    })
  ]);
  store.create("products", {}, {
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

test("create must throw an error if the type has not been defined", function (t) {
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.throws(function () {
    store.create("products", {});
  }, /Unknown type 'products'/);
});

test("create must use the correct content type header", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("POST", "/products", function (request) {
    t.notEqual(request.requestHeaders["Content-Type"].split(";").indexOf("application/vnd.api+json"), -1);
  });
  store.create("products", {});
  server.respond();
  server.restore();
});
