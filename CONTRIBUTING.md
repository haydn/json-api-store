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

## Release Process

1.  Check everything's clean:

    ```
    git checkout master
    git pull
    git push
    git status
    ```

2.  Check tests pass:

    ```
    npm test
    ```

3.  Rebuild docs:

    ```
    esdoc -c esdoc.json
    ```

4. Rebuild the dist version:

    ```
    babel src/store.js -m umd --module-id Store --compact true --no-comments -o dist/store.js
    ```

5.  Bump the version in the NPM & Bower manifests (replace X.X.X with the version number):

    ```
    sed -i.bak 's/"version": "[0-9].[0-9].[0-9]"/"version": "X.X.X"/' +(package|bower).json && rm +(package|bower).json.bak
    ```

6.  Commit & tag (replace X.X.X with the version number):

    ```
    git add .
    git commit -a -m "Release vX.X.X."
    git tag vX.X.X
    ```

7.  Push:

    ```
    git push --tags
    ```

8.  Update the website (replace X.X.X with the version number):

    ```
    cp -R dist ~/Desktop/dist
    cp -R docs ~/Desktop/docs
    cp -R example ~/Desktop/example
    git checkout gh-pages
    rm -r example
    cp ~/Desktop/dist/store.js dist/store.vX.X.X.js
    cp -R ~/Desktop/docs docs/vX.X.X
    cp -R ~/Desktop/example example
    rm -r ~/Desktop/dist ~/Desktop/docs ~/Desktop/example
    sed -i.bak 's/v[0-9].[0-9].[0-9]/vX.X.X/g' index.html && rm index.html.bak
    git add .
    git commit -a -m "Release vX.X.X."
    git push
    ```

9.  Update the release notes on GitHub.
