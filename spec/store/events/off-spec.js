var Store = require("../../../src/store");

describe("off", function() {

  var store, listener, context;

  beforeEach(function() {
    store = new Store();
    listener = {
      handler: function () {}
    };
    context = {};
    spyOn(listener, "handler");
    store.define("products", {});
  });

  it("must remove event handlers", function () {
    store.on("added", "products", "1", listener.handler, context);
    store.on("added", "products", listener.handler, context);
    store.on("updated", "products", "1", listener.handler, context);
    store.on("updated", "products", listener.handler, context);
    store.on("removed", "products", "1", listener.handler, context);
    store.on("removed", "products", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    store.add({
      "type": "products",
      "id": "1"
    });
    store.remove("products", "1");
    expect(listener.handler.calls.count()).toEqual(6);
    store.off("added", "products", "1", listener.handler, context);
    store.off("added", "products", listener.handler, context);
    store.off("updated", "products", "1", listener.handler, context);
    store.off("updated", "products", listener.handler, context);
    store.off("removed", "products", "1", listener.handler, context);
    store.off("removed", "products", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    store.add({
      "type": "products",
      "id": "1"
    });
    store.remove("products", "1");
    expect(listener.handler.calls.count()).toEqual(6);
  });

  it("must allow context to be optional");

  it("must throw an error when an unknown event is passed");

});
