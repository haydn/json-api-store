import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("push must add a single resource to the store", function (t) {
  var store = new Store();
  t.plan(1);
  store.define("products", {});
  sinon.spy(store, "add");
  var root = {
    "data": {
      "type": "products",
      "id": "34"
    }
  };
  store.push(root);
  t.ok(store.add.calledWith(root.data), "should call add with data pushed");
});

test("push must add a collection of resources to the store", function (t) {
  var store = new Store();
  t.plan(2);
  store.define("products", {});
  sinon.spy(store, "add");
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
  t.ok(store.add.calledWith(root.data[0]), "should call add with data pushed");
  t.ok(store.add.calledWith(root.data[1]), "should call add with data pushed");
});

test("push must add included resources to the store", function (t) {
  var store = new Store();
  t.plan(2);
  store.define("categories", {});
  store.define("products", {});
  sinon.spy(store, "add");
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
  t.ok(store.add.calledWith(root.included[0]), "should call add with data pushed");
  t.ok(store.add.calledWith(root.included[1]), "should call add with data pushed");
});
