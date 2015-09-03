import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("destroy must delete a resource from the server and remove it from the store on success", function (t) {
  var server = sinon.fakeServer.create({ autoRespond: true });
  var adapter = new Store.AjaxAdapter();
  var store = new Store(adapter);
  t.plan(2);
  t.timeoutAfter(1000);
  store.define("products", {});
  server.respondWith("DELETE", "/products/6", [
    204,
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
  store.destroy(store.find("products", "6"), function () {
    t.equal(store.find("products").length, 0);
  });
  server.restore();
});
