# JSON API Store

## Example Usage

```javascript

Store.type["categories"] = {
  title: Store.attr(),
  products: Store.hasMany()
};

Store.type["products"] = {
  title: Store.attr(),
  category: Store.hasOne()
};

var store = new Store();

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

var product = store.find("products", "1");
var category = store.find("categories", "1");

product.title; // "Example Book"
category.title; // "Books"

product.category === category; // true
category.products[0] === product; // true

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
