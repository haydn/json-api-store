# JSON API Store [![Build Status](https://travis-ci.org/haydn/json-api-store.svg?branch=master)](https://travis-ci.org/haydn/json-api-store)

JSON API Store (JAS) is browser store that implements the [JSON API](http://jsonapi.org) specification (version 1.0).

## Example Usage

At the moment you need to do your own AJAX requests, but JAS will store you data and maintain the relationships.

```javascript

// Define the "categories" type.
Store.types["categories"] = {
  title: Store.attr(),
  products: Store.hasMany({ inverse: "category" })
};

// Define the "products" type.
Store.types["products"] = {
  title: Store.attr(),
  category: Store.hasOne()
};

// Create a new store instance.
var store = new Store();

// Add data - this can just be the response from a GET request to your API.
store.push({
  "data": {
    "type": "products",
    "id": "1",
    "attributes": {
      "title": "Example Book"
    },
    "relationships": {
      "category": {
        "data": {
          "type": "categories",
          "id": "1"
        }
      }
    }
  },
  "included": [
    {
      "type": "categories",
      "id": "1",
      "attributes": {
        "title": "Books"
      }
    }
  ]
});

// Get the product from the store.
var product = store.find("products", "1");
// Get the category from the store.
var category = store.find("categories", "1");

product.title; // "Example Book"
category.title; // "Books"

product.category === category; // true
category.products[0] === product; // true

```

## Documentation

Documentation is available in the `docs` directory. It can be re-generated with
[esdoc](https://esdoc.org/):

```
esdoc -c esdoc.json
```

## Tests

You can run tests once-off with NPM:

```
npm test
```

Alternatively, you can run tests in watch mode using [nodemon](http://nodemon.io):

```
nodemon node_modules/jasmine/bin/jasmine.js
```

## Building

You can rebuild the the output from the source using
[babel](https://babeljs.io):

```
babel src/store.js -m umd --module-id Store --compact true --no-comments -o lib/store.js
```

## Roadmap

- examples
- online documentation / website
- NPM/Bower packages
- automated release process
- create, read, update & destroy AJAX methods
- event listeners for listening to changes
- type definitions using classes (aka, models)
- simple support for pluralisations/pseudonyms
- maybe a way to query the local data
- support for links & pagination
