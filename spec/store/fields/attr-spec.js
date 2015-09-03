import test from "tape-catch";
import Store from "../../../src/store";

test("attr must return the correct type attribute", function (t) {
  t.plan(1);
  t.equal(Store.attr().type, "attr");
});

test("attr must return a definition that has the default option passed", function (t) {
  t.plan(2);
  t.equal(Store.attr({ default: "foo" }).default, "foo");
  t.equal(Store.attr("example", { default: "foo" }).default, "foo");
});

test("attr must return a deserialize function that maps to the attribute provided", function (t) {
  var field = Store.attr("example-title");
  var data = {
    "type": "products",
    "id": "1",
    "attributes": {
      "example-title": "Example"
    }
  };
  t.plan(1);
  t.equal(field.deserialize.call(this, data), "Example");
});

test("attr must return a deserialize function that maps to the key if no attribute name is provided", function (t) {
  var store = new Store();
  var field = Store.attr();
  var data = {
    "type": "products",
    "id": "1",
    "attributes": {
      "title": "Example"
    }
  };
  t.plan(1);
  t.equal(field.deserialize.call(store, data, "title"), "Example");
});

test("attr must return a serialize function that maps to the attribute provided", function (t) {
  var field = Store.attr("example-title");
  var resource = {
    "type": "products",
    "id": "1",
    "example-title": "Example"
  };
  var data = {
    type: "products",
    id: "1",
    attributes: {},
    relationships: {}
  };
  t.plan(1);
  field.serialize.call(this, resource, data, "example-title");
  t.equal(data.attributes["example-title"], "Example");
});

test("attr must return a serialize function that maps to the key if no attribute name is provided", function (t) {
  var store = new Store();
  var field = Store.attr();
  var resource = {
    "type": "products",
    "id": "1",
    "title": "Example"
  };
  var data = {
    type: "products",
    id: "1",
    attributes: {},
    relationships: {}
  };
  t.plan(1);
  field.serialize.call(store, resource, data, "title");
  t.equal(data.attributes["title"], "Example");
});

test("attr must return undefined when the attribute is missing from the data", function (t) {
  var store = new Store();
  var field = Store.attr("title");
  t.plan(2);
  t.equal(field.deserialize.call(store, {
    "type": "products",
    "id": "1",
    "attributes": {}
  }, "title"), undefined);
  t.equal(field.deserialize.call(store, {
    "type": "products",
    "id": "1"
  }, "title"), undefined);
});
