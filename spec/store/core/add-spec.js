import test from "tape-catch";
import Store from "../../../src/store";

test("add must add a resource to the store", function (t) {
  var store = new Store();
  t.plan(2);
  store.define("products", {});
  store.add({
    "type": "products",
    "id": "44"
  });
  t.equal(store.find("products").length, 1);
  t.equal(store.find("products")[0].id, "44");
});

test("add must throw an error if the data doesn't have a type and id", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.add({});
  }, /The data must have a type and id/);
});

test("add must throw an error when called without arguments", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.add();
  }, /You must provide data to add/);
});

test("add must throw an error if the type has not been defined", function (t) {
  var store = new Store();
  t.plan(1);
  t.throws(function () {
    store.add({
      "type": "products",
      "id": "44"
    });
  }, /Unknown type 'products'/);
});

test("add must use deserialize functions provided by type definitions", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("products", {
    title: {
      deserialize: function (data, key) {
        return "Example " + data.id + " " + key;
      }
    }
  });
  store.add({
    "type": "products",
    "id": "44"
  });
  t.equal(store.find("products", "44").title, "Example 44 title");
});

test("add must not set fields when the deserialize function returns undefined", function (t) {
  var store = new Store();
  t.plan(2);
  store.define("products", {
    title: {
      deserialize: function (data) {
        if (data.attributes && data.attributes.title) {
          return "Example";
        }
      }
    }
  });
  store.add({
    "type": "products",
    "id": "44",
    "attributes": {
      "title": true
    }
  });
  t.equal(store.find("products", "44").title, "Example");
  store.add({
    "type": "products",
    "id": "44"
  });
  t.equal(store.find("products", "44").title, "Example");
});

test("add must set fields when the deserialize function returns null", function (t) {
  var store = new Store();
  t.plan(2);
  store.define("products", {
    title: {
      deserialize: function (data) {
        if (data.attributes && data.attributes.title) {
          return "Example";
        } else {
          return null;
        }
      }
    }
  });
  store.add({
    "type": "products",
    "id": "44",
    "attributes": {
      "title": true
    }
  });
  t.equal(store.find("products", "44").title, "Example");
  store.add({
    "type": "products",
    "id": "44"
  });
  t.equal(store.find("products", "44").title, null);
});

test("add must call deserialize functions in the context of the store", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("products", {
    example: {
      deserialize: function () {
        return this;
      }
    }
  });
  store.add({
    "type": "products",
    "id": "44"
  });
  t.equal(store.find("products", "44").example, store);
});

test("add inverse relationships must setup inverse one-to-one relationships", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("categories", {
    product: Store.hasOne({ inverse: "category" })
  });
  store.define("products", {
    category: Store.hasOne({ inverse: "product" })
  });
  store.add({
    "type": "products",
    "id": "10",
    "relationships": {
      "category": {
        "data": { "type": "categories", "id": "1" }
      }
    }
  });
  t.equal(store.find("categories", "1").product, store.find("products", "10"));
});

test("add inverse relationships must setup inverse one-to-many relationships", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("categories", {
    products: Store.hasMany({ inverse: "category" })
  });
  store.define("products", {
    category: Store.hasOne({ inverse: "products" })
  });
  store.add({
    "type": "products",
    "id": "10",
    "relationships": {
      "category": {
        "data": { "type": "categories", "id": "1" }
      }
    }
  });
  store.add({
    "type": "products",
    "id": "20",
    "relationships": {
      "category": {
        "data": { "type": "categories", "id": "1" }
      }
    }
  });
  t.deepEqual(store.find("categories", "1").products.map(x => x.id).sort(), [ "10", "20" ]);
});

test("add inverse relationships must setup inverse many-to-many relationships", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("categories", {
    products: Store.hasMany({ inverse: "categories" })
  });
  store.define("products", {
    categories: Store.hasMany({ inverse: "products" })
  });
  store.add({
    "type": "categories",
    "id": "10",
    "relationships": {
      "products": {
        "data": [
          { "type": "products", "id": "1" }
        ]
      }
    }
  });
  store.add({
    "type": "categories",
    "id": "20",
    "relationships": {
      "products": {
        "data": [
          { "type": "products", "id": "1" }
        ]
      }
    }
  });
  t.deepEqual(store.find("products", "1").categories.map(x => x.id).sort(), [ "10", "20" ]);
});

test("add inverse relationships must setup inverse many-to-one relationships", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("categories", {
    products: Store.hasMany({ inverse: "category" })
  });
  store.define("products", {
    category: Store.hasOne({ inverse: "products" })
  });
  store.add({
    "type": "categories",
    "id": "10",
    "relationships": {
      "products": {
        "data": [
          { "type": "products", "id": "1" }
        ]
      }
    }
  });
  store.add({
    "type": "categories",
    "id": "20",
    "relationships": {
      "products": {
        "data": [
          { "type": "products", "id": "1" }
        ]
      }
    }
  });
  t.equal(store.find("products", "1").category, store.find("categories", "20"));
});

test("add inverse relationships must throw an error when an inverse relationship is an attribute", function (t) {
  var store = new Store();
  t.plan(2);
  store.define("categories", {
    product: Store.attr()
  });
  store.define("comments", {
    product: Store.attr()
  });
  store.define("products", {
    category: Store.hasOne({ inverse: "product" }),
    comments: Store.hasMany({ inverse: "product" })
  });
  t.throws(function () {
    store.add({
      "type": "products",
      "id": "44",
      "relationships": {
        "category": {
          "data": { "type": "categories", "id": "34" }
        }
      }
    });
  }, /The the inverse relationship for 'category' is an attribute \('product'\)/);
  t.throws(function () {
    store.add({
      "type": "products",
      "id": "44",
      "relationships": {
        "comments": {
          "data": [
            { "type": "comments", "id": "3" }
          ]
        }
      }
    });
  }, /The the inverse relationship for 'comments' is an attribute \('product'\)/);
});

test("add inverse relationships must throw an error when an explict inverse relationship is absent", function (t) {
  var store = new Store();
  t.plan(3);
  store.define("categories", {});
  store.define("comments", {});
  store.define("products", {
    category: Store.hasOne({ inverse: "product" }),
    comments: Store.hasMany({ inverse: "products" }),
    users:    Store.hasMany()
  });
  store.define("users", {});
  t.throws(function () {
    store.add({
      "type": "products",
      "id": "44",
      "relationships": {
        "category": {
          "data": { "type": "categories", "id": "34" }
        }
      }
    });
  }, /The the inverse relationship for 'category' is missing \('product'\)/);
  t.throws(function () {
    store.add({
      "type": "products",
      "id": "44",
      "relationships": {
        "comments": {
          "data": [
            { "type": "comments", "id": "3" }
          ]
        }
      }
    });
  }, /The the inverse relationship for 'comments' is missing \('products'\)/);
  t.doesNotThrow(function () {
    store.add({
      "type": "products",
      "id": "44",
      "relationships": {
        "users": {
          "data": [
            { "type": "users", "id": "6" }
          ]
        }
      }
    });
  });
});

test("add inverse relationships must not try to process inverse relationships for absent relationships", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("categories", {
    products: Store.hasMany({ inverse: "category" })
  });
  store.define("products", {
    category: Store.hasOne({ inverse: "products" })
  });
  t.doesNotThrow(function () {
    store.add({
      "type": "products",
      "id": "44"
    });
  });
});

test("add inverse relationships must remove null (has one) inverse relationships", function (t) {
  var store = new Store();
  t.plan(2);
  store.define("categories", {
    products: Store.hasMany({ inverse: "category" })
  });
  store.define("products", {
    category: Store.hasOne({ inverse: "products" })
  });
  store.add({
    "type": "products",
    "id": "44",
    "relationships": {
      "category": {
        "data": { "type": "categories", "id": "34" }
      }
    }
  });
  t.deepEqual(store.find("categories", "34").products.map(x => x.id).sort(), [ "44" ]);
  store.add({
    "type": "products",
    "id": "44",
    "relationships": {
      "category": {
        "data": null
      }
    }
  });
  t.deepEqual(store.find("categories", "34").products, []);
});

test("add inverse relationships must remove empty (has many) inverse relationships", function (t) {
  var store = new Store();
  t.plan(3);
  store.define("categories", {
    products: Store.hasMany({ inverse: "category" })
  });
  store.define("products", {
    category: Store.hasOne({ inverse: "products" })
  });
  store.add({
    "type": "categories",
    "id": "37",
    "relationships": {
      "products": {
        "data": [
          { "type": "products", "id": "23" },
          { "type": "products", "id": "45" }
        ]
      }
    }
  });
  t.equal(store.find("products", "23").category, store.find("categories", "37"));
  t.equal(store.find("products", "45").category, store.find("categories", "37"));
  store.add({
    "type": "categories",
    "id": "37",
    "relationships": {
      "products": {
        "data": [
          { "type": "products", "id": "23" }
        ]
      }
    }
  });
  t.equal(store.find("products", "45").category, null);
});

test("add inverse relationships must use the type's name as a fallback for relationship names when adding resources", function (t) {
  var store = new Store();
  t.plan(2);
  store.define("categories", {
    products: Store.hasMany()
  });
  store.define("products", {
    categories: Store.hasMany()
  });
  store.add({
    "type": "categories",
    "id": "37",
    "relationships": {
      "products": {
        "data": [
          { "type": "products", "id": "23" }
        ]
      }
    }
  });
  t.deepEqual(store.find("categories", "37").products.map(x => x.id).sort(), [ "23" ]);
  t.deepEqual(store.find("products", "23").categories.map(x => x.id).sort(), [ "37" ]);
});
