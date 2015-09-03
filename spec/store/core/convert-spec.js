import test from "tape-catch";
import sinon from "sinon";
import Store from "../../../src/store";

test("convert must use serialize functions provided by type definitions", function (t) {
  var store = new Store();
  var serialize = sinon.spy(function (resource, data) {
    data.attributes.title = resource.title + "!";
  });
  var resource = {
    type: "products",
    id: "44",
    title: "Example"
  };
  t.plan(3);
  store.define("products", {
    title: {
      serialize: serialize
    }
  });
  store.convert(resource).attributes.title
  t.equal(serialize.firstCall.args[0], resource);
  t.deepEqual(serialize.firstCall.args[1], { type: "products", id: "44", attributes: { title: "Example!" }, relationships: {} });
  t.equal(serialize.firstCall.args[2], "title");
});
