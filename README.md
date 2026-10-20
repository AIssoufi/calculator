# Calculatrice
<p align="center">
  <img src="https://raw.githubusercontent.com/AIssoufi/calculatrice/master/public/images/capture.png " alt="capture d'écran">
</p>

## [Démo](https://aissoufi.github.io/calculatrice)

## Lancer le projet
```
npm start
```

## Tests

Use the Node.js version pinned in `.nvmrc` (`nvm use` selects it), then:

```bash
npm ci                        # install the dependencies from package-lock.json
npm test                      # watch mode: re-runs the tests of the changed files
npm test -- --watchAll=false  # a single run of every test, as in the CI
```

Tests sit next to the code they cover and are named `*.spec.js` or `*.spec.jsx`.

The [CI workflow](.github/workflows/ci.yml) runs on every pull request and every push to `master`:

1. it installs the dependencies with `npm ci`;
2. it runs the tests once;
3. it builds the app.

A failing test or build fails the check.

## Technos utilisées
* [ReactJS](http://redux.js.org)
* [ReduxJS](http://redux.js.org)

## Autres captures d'écran
<p align="center">
<img src="https://raw.githubusercontent.com/AIssoufi/calculatrice/master/public/images/redux.png" alt="redux">
<img src="https://raw.githubusercontent.com/AIssoufi/calculatrice/master/public/images/react.png" alt="react">
</p>