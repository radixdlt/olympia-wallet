# radixdlt-desktop-wallet
Welcome to the Radix Wallet README.

## Project setup
```
yarn
cp .envrc{.sample,}
cp dev-app-update.yml{.sample,}
```

After copying the contents of `dev-app-update.yml.sample` to
`dev-app-update.yml`, make sure to update the github token to a valid token.

### Compiles and hot-reloads for development
```
yarn run electron:serve
```

### Compiles and minifies for production
```
yarn run electron:build
```

### Run your unit tests
```
yarn run test:unit
```

### Lints and fixes files
```
yarn run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

