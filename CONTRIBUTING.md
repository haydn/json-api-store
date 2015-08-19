## Release Process

1.  Check everything's clean:

    ```
    git push
    git pull
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

5.  Bump the version in `package.json` (replace X.X.X with the version number):

    ```
    sed -i.bak 's/"version": "[0-9].[0-9].[0-9]"/"version": "X.X.X"/' package.json && rm package.json.bak
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

8.  Update the release notes on GitHub.
