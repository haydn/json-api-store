## Tests

You can run tests once-off with NPM:

```
npm test
```

Alternatively, you can run tests in watch mode using
[nodemon](http://nodemon.io):

```
nodemon node_modules/jasmine/bin/jasmine.js
```

## Documentation

You can generate the documentation with [esdoc](https://esdoc.org/):

```
esdoc -c esdoc.json
```

## Building

You can rebuild the the output from the source using
[babel](https://babeljs.io):

```
babel src/store.js -m umd --module-id Store --compact true --no-comments -o dist/store.js
```

## Releases

You can make a new release using the script:

```
script/release
```
