describe("Store", function() {

  var Store, store;

  beforeEach(function() {
    Store = require("../../src/store");
    // Store.ajax = fakejax;
    store = new Store();
  });

  it("should have a push method", function () {
    expect().toBeDefined();
  });

  it("should have a push method", function () {
    expect(store.push).toBeDefined();
  });

});
