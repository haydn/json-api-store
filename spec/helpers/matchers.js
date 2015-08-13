beforeEach(function () {

  jasmine.addMatchers({

    toHaveIds: function (util, customEqualityTesters) {
      customEqualityTesters = customEqualityTesters || [];
      return {
        compare: function (actual, expected) {
          var result = { pass: false };
          actual = actual.map(function (resource) {
            return resource.id;
          }).sort();
          expected = expected.sort();
          result.pass = util.equals(actual, expected, customEqualityTesters);
          if (!result.pass) {
            result.message = "Expected " + JSON.stringify(actual) + " to have ids " + JSON.stringify(expected) + ".";
          }
          return result;
        }
      };
    }

  });

});
