var Store = require("../../../src/store");

describe("create", function() {

  var adapter, store;

  beforeEach(function() {
    adapter = new Store.AjaxAdapter();
    store = new Store(adapter);
  });

});
