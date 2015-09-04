## Development Requirements

- Node.js
- PhantomJS

## Getting Started

Clone the project and install NPM packages:

```
git clone git@github.com:haydn/json-api-store.git
cd json-api-store
npm install
```

## Running Tests

You can run tests once-off with NPM:

```
npm test
```

Alternatively, you can run tests in watch mode:

```
npm test watch
```

## Generating Documentation

You can regenerate the documentation with:

```
npm run docs
```

## Building Distribution

You can rebuild the the output from the source using:

```
npm run build
```

## Making Releases

There's a script available for making releases. Without the required
permissions, you won't get you very far, but if you're curious here it is:

```
npm run release
```
