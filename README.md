# JSON API Store [![Build Status](https://travis-ci.org/haydn/json-api-store.svg?branch=master)](https://travis-ci.org/haydn/json-api-store) [![NPM Version](https://badge.fury.io/js/json-api-store.svg)](http://badge.fury.io/js/json-api-store) [![bitHound Score](https://www.bithound.io/github/haydn/json-api-store/badges/score.svg)](https://www.bithound.io/github/haydn/json-api-store)

An isomorphic JavaScript library that acts as an in memory data store for
[JSON API](http://jsonapi.org) data. Changes are
broadcast using [RxJS](https://github.com/Reactive-Extensions/RxJS). Built to
work with [React](https://facebook.github.io/react/).

## Usage

### Browser

At the moment the primary use can for JSON API Store is in the browser:

```javascript

// Create a new store instance.
var adapter = new Store.AjaxAdapter({ base: "/api/v1" });
var store = new Store(adapter);

// Define the "categories" type.
store.define([ "categories", "category" ], {
  title: Store.attr(),
  products: Store.hasMany()
});

// Define the "products" type.
store.define([ "products", "product" ], {
  title: Store.attr(),
  category: Store.hasOne()
});

// Subscribe to events using RxJS.
store.observable.subscribe(function (event) {
  console.log(event.name, event.type, event.id, event.resource);
});

// Load all the products.
store.load("products", { include: "category" }, function (products) {

  products.length; // 1
  products[0].id; // "1"
  products[0].title; // "Example Book"
  products[0].category.id; // "1"
  products[0].category.title; // "Books"

  products[0] === store.find("products", "1"); // true
  products[0].category === store.find("categories", "1"); // true

});

```

### Node

You can also use JSON API Store in a Node.js environment (currently, there
aren't any adapters that work in a Node.js):

**NOTE**: Without an adapter the CLUD methods (`create`, `load`, `update` and
`destroy`) cannot be used.

```javascript

var Store = require("json-api-store");

var store = new Store();

store.define([ "categories", "category" ], {
  title: Store.attr(),
  products: Store.hasMany()
});

store.define([ "products", "product" ], {
  title: Store.attr(),
  category: Store.hasOne()
});

store.add({
  type: "products",
  id: "1",
  attributes: {
    title: "Example Product"
  },
  relationships: {
    category: {
      data: {
        type: "categories",
        id: "1"
      }
    }
  }
});

store.add({
  type: "categories",
  id: "1",
  attributes: {
    title: "Example Category"
  }
});

store.find("products", "1").category.title; // "Example Category"

```

## Documentation

Full documentation is available on the website:

http://particlesystem.com/json-api-store/

## Installing

#### NPM

```
npm i json-api-store
```

#### Bower

```
bower i json-api-store
```

#### Download

To use directly in the browser you can grab the [store.prod.js](https://raw.githubusercontent.com/haydn/json-api-store/master/dist/store.prod.js) file.
