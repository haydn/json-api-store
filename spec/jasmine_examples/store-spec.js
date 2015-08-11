var Store = require("../../src/store");

describe("Store", function() {

  var store;

  beforeEach(function() {
    Store.types = {};
    store = new Store();
  });

  describe("find", function () {

    it("must return an object with type and id fields when an id is provided", function () {
      Store.types["products"] = {};
      expect(store.find("products", "23").type).toBe("products");
      expect(store.find("products", "74").id).toBe("74");
    });

    it("must return the same object if called with the same arguments", function () {
      Store.types["products"] = {};
      expect(store.find("products", "23")).toBe(store.find("products", "23"));
    });

    it("must return an array of objects when no id is provided", function () {
      Store.types["products"] = {};
      var a = store.find("products", "1");
      expect(store.find("products")).toContain(a);
    });

    it("must throw an error when trying to find an unknown resource type", function () {
      expect(function () {
        store.find("products");
      }).toThrowError(TypeError, "Missing type 'products'");
      expect(function () {
        store.find("products", "1");
      }).toThrowError(TypeError, "Missing type 'products'");
    });

    it("must throw an error when called without arguments", function () {
      expect(function () {
        store.find();
      }).toThrowError(TypeError, "You must provide a type");
    });

  });

  describe("add", function () {

    it("must add a resource to the store", function () {
      Store.types["products"] = {};
      store.add({
        "type": "products",
        "id": "44"
      });
      expect(store.find("products").length).toBe(1);
      expect(store.find("products")[0].id).toBe("44");
    });

    it("must throw an error if the data doesn't have a type and id", function () {
      expect(function () {
        store.add({});
      }).toThrowError(TypeError, "The data must have a type and id");
    });

    it("must throw an error when called without arguments", function () {
      expect(function () {
        store.add();
      }).toThrowError(TypeError, "You must provide data to add");
    });

  });

  describe("push", function () {

    it("must add a single resource to the store", function () {
      Store.types["products"] = {};
      store.push({
        "data": {
          "type": "products",
          "id": "34"
        }
      });
      expect(store.find("products").length).toBe(1);
      expect(store.find("products")[0].id).toBe("34");
    });

    it("must add a collection of resources to the store", function () {
      Store.types["products"] = {};
      store.push({
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
      });
      expect(store.find("products").length).toBe(2);
      var ids = store.find("products").map(function (x) {
        return x.id;
      });
      expect(ids).toContain("34");
      expect(ids).toContain("74");
    });

  });

});
