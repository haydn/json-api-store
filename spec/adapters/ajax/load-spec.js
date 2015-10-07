import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("load must fetch a single resource from the server and add it to the store", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(6);
  t.timeoutAfter(1000);
  store.define("products", {
    title: Store.attr(),
    category: Store.hasOne(),
    comments: Store.hasMany()
  });
  store.define("categories", {});
  store.define("comments", {});
  server.respondWith("GET", "/products/12", function (request) {
    t.false(request.requestBody);
    var data = {
      data: {
        type: "products",
        id: "12",
        attributes: {
          title: "An Awesome Book"
        },
        relationships: {
          category: {
            data: {
              id: "6",
              type: "categories"
            }
          },
          comments: {
            data: [
              {
                id: "2",
                type: "comments"
              },
              {
                id: "4",
                type: "comments"
              }
            ]
          }
        }
      }
    };
    request.respond(200, { "Content-Type": "application/vnd.api+json" }, JSON.stringify(data));
  });
  store.load("products", "12").subscribe(function (product) {
    t.equal(store.find("products", "12"), product);
    t.equal(store.find("products", "12").title, "An Awesome Book");
    t.equal(store.find("products", "12").category, store.find("categories", "6"));
    t.deepEqual(store.find("products", "12").comments.map(c => c.id).sort(), [ "2", "4" ]);
    t.deepEqual(store.find("products", "12").comments.map(c => c.type).sort(), [ "comments", "comments" ]);
  });
  server.respond();
  server.restore();
});

test("load must fetch a collection of resources from the server and add them to the store", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(3);
  t.timeoutAfter(1000);
  store.define("products", {
    title: Store.attr()
  });
  server.respondWith("GET", "/products", [
    200,
    {
      "Content-Type": "application/vnd.api+json"
    },
    JSON.stringify({
      data: [
        {
          type: "products",
          id: "2",
          attributes: {
            title: "A Book"
          }
        },
        {
          type: "products",
          id: "4",
          attributes: {
            title: "B Book"
          }
        },
        {
          type: "products",
          id: "7",
          attributes: {
            title: "C Book"
          }
        }
      ]
    })
  ]);
  store.load("products").subscribe(function (products) {
    t.equal(products.length, 3);
    t.equal(store.find("products").length, 3);
    t.deepEqual(store.find("products").map(a => a.title).sort(), [ "A Book", "B Book", "C Book" ]);
  }, function (error) {
    t.fail(error);
  });
  server.respond();
  server.restore();
});

test("load must handle 500 errors for failed attempts", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(2);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("GET", "/products/12", [
    500,
    { "Content-Type": "application/vnd.api+json" },
    ""
  ]);
  t.equal(store.find("products").length, 0);
  store.load("products", "12").subscribe(function () {
    t.fail("must not call the success callback");
  }, function () {
    t.equal(store.find("products").length, 0);
  });
  server.respond();
  server.restore();
});

test("load must use the adapter's 'base' config if present", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter({ base: "http://example.com" });
  var store = new Store(adapter);
  t.plan(3);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("GET", "http://example.com/products/9", [
    200,
    { "Content-Type": "application/vnd.api+json" },
    JSON.stringify({
      data: { type: "products", id: "9" }
    })
  ]);
  server.respondWith("GET", "http://example.com/products", [
    200,
    { "Content-Type": "application/vnd.api+json" },
    JSON.stringify({
      data: [
        { type: "products", id: "2" },
        { type: "products", id: "4" },
        { type: "products", id: "7" }
      ]
    })
  ]);
  t.equal(store.find("products").length, 0);
  store.load("products", "9").subscribe(function () {
    t.equal(store.find("products").length, 1);
    store.load("products").subscribe(function () {
      t.deepEqual(store.find("products").map(x => x.id).sort(), [ "2", "4", "7", "9" ]);
    });
    server.respond();
  });
  server.respond();
  server.restore();
});

test("load must call the error callback if an error is raised during the process", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  var callback = sinon.spy();
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("GET", "/products/1", [
    200,
    { "Content-Type": "application/vnd.api+json" },
    JSON.stringify({
      data: { type: "products", id: "1" },
      included: [
        { type: "foo", id: "1" },
      ]
    })
  ]);
  store.load("products", "1").subscribe(function () {}, callback);
  server.respond();
  t.equal(callback.callCount, 1);
  server.restore();
});

test("load must use the options if they're provided", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("GET", "/products?fields[products]=title%2Cdescription&filter=foo&include=author%2Ccomments.user&page=1&sort=age%2Cname%2C-created", [
    200,
    { "Content-Type": "application/vnd.api+json" },
    JSON.stringify({
      data: [],
      included: []
    })
  ]);
  store.load("products", {
    include: "author,comments.user",
    fields: {
      products: "title,description"
    },
    sort: "age,name,-created",
    page: 1,
    filter: "foo"
  }).subscribe(function (products) {
    t.pass("returns a successful response");
  }, function (error) {
    t.fail(error);
  });
  server.respond();
  server.restore();
});

test("load must throw an error if the type has not been defined", function (t) {
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.throws(function () {
    store.load("products", "1");
  }, /Unknown type 'products'/);
});

test("load must use the correct content type header", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: false });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(1);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("GET", "/products/6", function (request) {
    t.notEqual(request.requestHeaders["Content-Type"].split(";").indexOf("application/vnd.api+json"), -1);
  });
  store.load("products", "6");
  server.respond();
  server.restore();
});
