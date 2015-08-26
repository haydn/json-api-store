var Store = require("../../../src/store");

describe("update", function() {

  var adapter, store;

  beforeEach(function() {
    adapter = new Store.AjaxAdapter();
    store = new Store(adapter);
  });

});
