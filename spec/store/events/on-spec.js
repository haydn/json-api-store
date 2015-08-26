var Store = require("../../../src/store");

describe("on", function() {

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

  it("must fire an added event when the resource with the given type & id is added to the store", function () {
    store.on("added", "products", "1", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
    expect(listener.handler.calls.mostRecent().object).toBe(context);
  });

  it("must fire an added event when the resource with the given type is added to the store", function () {
    store.on("added", "products", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
    expect(listener.handler.calls.mostRecent().object).toBe(context);
  });

  it("must fire an updated event when the resource with the given type & id is updated in the store", function () {
    store.on("updated", "products", "1", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler.calls.count()).toEqual(0);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
    expect(listener.handler.calls.mostRecent().object).toBe(context);
  });

  it("must fire an updated event when the resource with the given type is updated in the store", function () {
    store.on("updated", "products", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler.calls.count()).toEqual(0);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
    expect(listener.handler.calls.mostRecent().object).toBe(context);
  });

  it("must fire an removed event when the resource with the given type & id is removed from the store", function () {
    store.on("removed", "products", "1", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler.calls.count()).toEqual(0);
    store.remove("products", "1");
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
    expect(listener.handler.calls.mostRecent().object).toBe(context);
  });

  it("must fire an removed event when the resource with the given type is removed from the store", function () {
    store.on("removed", "products", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler.calls.count()).toEqual(0);
    store.remove("products", "1");
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
    expect(listener.handler.calls.mostRecent().object).toBe(context);
  });

  it("must not fire an added event when automatically creating a resource as the result of a find", function () {
    store.on("added", "products", "1", listener.handler, context);
    store.find("products", "1");
    expect(listener.handler.calls.count()).toEqual(0);
  });

  it("must throw an error when an unknown event is passed", function () {
    expect(function () {
      store.on("foo", "products", "1", listener.handler, context);
    }).toThrowError("Unknown event 'foo'");
  });

  it("must throw an error if the type has not been defined", function () {
    expect(function () {
      store.on("added", "foo", "1", listener.handler, context);
    }).toThrowError("Unknown type 'foo'");
  });

});
