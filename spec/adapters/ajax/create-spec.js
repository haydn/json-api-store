import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("create must post a resource to the server and add it to the store on success", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: true });
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
  store.create({ type: "products", title: "My Book" }, function (product) {
    t.equal(product.title, "My Book");
    t.equal(store.find("products", "9").title, "My Book");
  });
  server.restore();
});

test.skip("must throw an error if resource is missing a 'type' property");

test.skip("must call the error callback if an undefined type is included");

test.skip("must call the error callback if the server responds with a non-2xx code");
