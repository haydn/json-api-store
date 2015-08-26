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
    store.remove({ type: "products", id: "1" });
    expect(listener.handler.calls.count()).toEqual(6);
    store.off("added", "products", "1", listener.handler);
    store.off("added", "products", listener.handler);
    store.off("updated", "products", "1", listener.handler);
    store.off("updated", "products", listener.handler);
    store.off("removed", "products", "1", listener.handler);
    store.off("removed", "products", listener.handler);
    store.add({
      "type": "products",
      "id": "1"
    });
    store.add({
      "type": "products",
      "id": "1"
    });
    store.remove({ type: "products", id: "1" });
    expect(listener.handler.calls.count()).toEqual(6);
  });

  it("must throw an error when an unknown event is passed", function () {
    expect(function () {
      store.off("foo", "products", "1", listener.handler);
    }).toThrowError("Unknown event 'foo'");
  });

  it("must throw an error if the type has not been defined", function () {
    expect(function () {
      store.off("added", "foo", "1", listener.handler);
    }).toThrowError("Unknown type 'foo'");
  });

});
