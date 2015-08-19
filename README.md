# JSON API Store [![Build Status](https://travis-ci.org/haydn/json-api-store.svg?branch=master)](https://travis-ci.org/haydn/json-api-store)

JSON API Store takes [JSON API](http://jsonapi.org) data and creates plain
JavaScript objects for the resources it describes. It will link-up
relationships automatically and update both sides of reciprocal relationships
when either side is modified.

## Usage

At the moment you need to do your own AJAX requests, but there are plans to add
AJAX methods to create, read, update and destroy resources in the future. For
now you can just push the responses from your own requests to the store:

```javascript

// Create a new store instance.
var store = new Store();

// Define the "categories" type.
store.define("categories", {
  title: Store.attr(),
  products: Store.hasMany({ inverse: "category" })
});

// Define the "products" type.
store.define("products", {
  title: Store.attr(),
  category: Store.hasOne()
});

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

store.find("products", "1").title; // "Example Book"
store.find("categories", "1").title; // "Books"

store.find("products", "1").category === store.find("categories", "1"); // true
store.find("categories", "1").products[0] === store.find("products", "1"); // true

```

## Installing

#### NPM

```
npm i json-api-store
```

#### Bower

```
bower i json-api-store
```

#### Manual

Grab the [store.js](https://raw.githubusercontent.com/haydn/json-api-store/master/dist/store.js) file.

## Documentation

Documentation is available in the `docs` directory. Online documentation is coming soon.

## Roadmap

- support for pluralisations/pseudonyms
- online documentation / website
- automated release process
- event listeners for listening to changes
- create, read, update & destroy AJAX methods
- ES6 classes for type definitions
- a way to query the local data?
- adapters for CRUD actions / isomorphic support?
- support for links & pagination
