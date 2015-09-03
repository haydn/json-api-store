import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("load must fetch a single resource from the server and add it to the store", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: true });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(5);
  t.timeoutAfter(1000);
  store.define("products", {
    title: Store.attr(),
    category: Store.hasOne(),
    comments: Store.hasMany()
  });
  store.define("categories", {});
  store.define("comments", {});
  server.respondWith("GET", "/products/12", [
    200,
    {
      "Content-Type": "application/vnd.api+json"
    },
    JSON.stringify({
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
    })
  ]);
  store.load("products", "12", function (product) {
    t.equal(store.find("products", "12"), product);
    t.equal(store.find("products", "12").title, "An Awesome Book");
    t.equal(store.find("products", "12").category, store.find("categories", "6"));
    t.deepEqual(store.find("products", "12").comments.map(c => c.id).sort(), [ "2", "4" ]);
    t.deepEqual(store.find("products", "12").comments.map(c => c.type).sort(), [ "comments", "comments" ]);
  });
  server.restore();
});

test("load must fetch a collection of resources from the server and add them to the store", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: true });
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
  store.load("products", function (products) {
    t.equal(products.length, 3);
    t.equal(store.find("products").length, 3);
    t.deepEqual(store.find("products").map(a => a.title).sort(), [ "A Book", "B Book", "C Book" ]);
  }, function (error) {
    t.fail(error);
  });
  server.restore();
});

test.skip("must call the error callback if an undefined type is included");

test.skip("must call the error callback if the server responds with a non-2xx code");

test.skip("must return a promise if no callbacks are provided");
