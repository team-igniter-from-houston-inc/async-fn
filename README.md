# asyncFn

![Build and test](https://github.com/team-igniter-from-houston-inc/async-fn/workflows/Build%20and%20test/badge.svg) [![Gitter](https://badges.gitter.im/async-fn/community.svg)](https://gitter.im/async-fn/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![asyncFn](https://raw.githubusercontent.com/team-igniter-from-houston-inc/async-fn/master/logo.png)

**[asyncFn](https://github.com/team-igniter-from-houston-inc/async-fn)** is a library that provides additional methods to [jest.fn](https://www.npmjs.com/package/@async-fn/jest) or [sinon.spy](https://www.npmjs.com/package/@async-fn/sinon) to introduce "**late resolve**" for the promises returned.

This simplifies async unit testing by allowing tests that read chronologically, **[like a story](TUTORIAL.md)**.

asyncFn has zero non-native dependencies. It has **100% unit-test coverage**, and 3+ years of focused **production use** with high **developer satisfaction**.

asyncFn is also **integration-tested** for combinations of recent OS-, node- and mocking framework -versions. 

## How to install

```
$ npm install --save-dev @asyncFn/jest
```

or

```
$ npm install --save-dev @asyncFn/sinon
```

See more details for [jest](./packages/jest/README.md) or [sinon](./packages/sinon/README.md).

## Tutorial

See tutorial [here](TUTORIAL.md).

## Examples

See examples for [jest](./packages/jest/README.md) or [sinon](./packages/sinon/README.md).

## Who are we?

asyncFn is lovingly crafted by Your pals at **Team: Igniter from [Houston Inc. Consulting](https://houston-inc.com)**.

We are a software development team of **friends**, with proven tradition in professional excellence. We specialize in holistic rapid deployments without sacrificing quality.

Come say hi at [Gitter](https://gitter.im/async-fn/community), [email](mailto:igniter@houston-inc.com) us, or check out the [team's website](https://team.igniter.houston.io). We just might be open to hiring ;)
