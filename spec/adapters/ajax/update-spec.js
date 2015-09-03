import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("update must update a resource on the server and add reflect the changes in the store on success", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: true });
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
  store.update({ type: "products", id: "9", title: "My Book!" }, function (product) {
    t.equal(product.title, "My Book!");
    t.equal(store.find("products", "9").title, "My Book!");
  });
  server.restore();
});
