# Auto Merge Back

This repo should make our deploying lives a bit better

## Code in Master

Install the dependencies
Build the typescript
Run the tests :heavy_check_mark:

```bash
$ npm install
$ npm run build
$ npm test
```

## Publish to a distribution branch

Actions are run from GitHub repos. We will create a releases branch and only checkin production modules (core in this case).

Comment out node_modules in .gitignore and create a releases/v1 branch

```bash
# comment out in distribution branches
# node_modules/
```

```bash
$ git checkout -b releases/v1
$ git commit -a -m "prod dependencies"
```

```bash
$ npm prune --production
$ git add node_modules
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and tested action

```yaml
uses: actions/typescript-action@v1
with:
  milliseconds: 1000
```
