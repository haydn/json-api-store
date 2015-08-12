var Store = require("../../src/store");

describe("push", function() {

  var store;

  beforeEach(function() {
    Store.types = {};
    store = new Store();
  });

  it("must add a single resource to the store", function () {
    Store.types["products"] = {};
    spyOn(store, 'add');
    var root = {
      "data": {
        "type": "products",
        "id": "34"
      }
    };
    store.push(root);
    expect(store.add).toHaveBeenCalledWith(root.data);
  });

  it("must add a collection of resources to the store", function () {
    Store.types["products"] = {};
    spyOn(store, 'add');
    var root = {
      "data": [
        {
          "type": "products",
          "id": "34"
        },
        {
          "type": "products",
          "id": "74"
        }
      ]
    };
    store.push(root);
    expect(store.add).toHaveBeenCalledWith(root.data[0]);
    expect(store.add).toHaveBeenCalledWith(root.data[1]);
  });

  it("must add included resources to the store", function () {
    Store.types["categories"] = {};
    Store.types["products"] = {};
    spyOn(store, 'add');
    var root = {
      "data": {
        "type": "categories",
        "id": "34"
      },
      "included": [
        {
          "type": "products",
          "id": "34"
        },
        {
          "type": "products",
          "id": "74"
        }
      ]
    };
    store.push(root);
    expect(store.add).toHaveBeenCalledWith(root.included[0]);
    expect(store.add).toHaveBeenCalledWith(root.included[1]);
  });

});
