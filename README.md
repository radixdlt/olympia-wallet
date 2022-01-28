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

### Building a Release

If you want to cut a new release for `v1.3.1`

* Write a commit to `main` that includes the new version in `package.json`,
    update the changelog for the new version (ie '1.3.1' in package.json)
* Draft a new release.  Set the 'tag version' to the version in your
    `package.json`
* Let CI Run and produce builds for the draft release, you should see release
    files update as you continue to push commits to `main`.
* When ready to release, Radix will use the Windows signing key to sign the
    windows executable.
* Download and run the `scripts/sign-windows.js` script against the windows
    release and use the produced hash to update the `latest.yml` file.  (Do not
    update the other latest files.
* Once the windows exe and its latest.yml file have been updated, publish the
    release.
