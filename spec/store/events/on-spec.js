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
    store.define([ "products", "product" ], {});
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
    store.remove({ type: "products", id: "1" });
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
    store.remove({ type: "products", id: "1" });
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

  it("must call listeners that were added using a different pseudonym", function () {
    store.on("added", "product", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler.calls.count()).toEqual(1);
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
  });

  it("must not add the same listener multiple times for the same type", function () {
    store.on("added", "products", listener.handler, context);
    store.on("added", "products", listener.handler);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler.calls.count()).toEqual(1);
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
  });

  it("must not add the same listener multiple times for the same type and id", function () {
    store.on("added", "products", "1", listener.handler, context);
    store.on("added", "products", "1", listener.handler);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler.calls.count()).toEqual(1);
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
  });

  it("must add the same listener multiple times if the id is different", function () {
    store.on("added", "products", "1", listener.handler, context);
    store.on("added", "products", "2", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    store.add({
      "type": "products",
      "id": "2"
    });
    expect(listener.handler.calls.count()).toEqual(2);
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "2"));
  });

  it("must not add the same listener multiple times for different pseudonyms of the same type", function () {
    store.on("added", "products", listener.handler, context);
    store.on("added", "product", listener.handler, context);
    store.add({
      "type": "products",
      "id": "1"
    });
    expect(listener.handler.calls.count()).toEqual(1);
    expect(listener.handler).toHaveBeenCalledWith(store.find("products", "1"));
  });

});
