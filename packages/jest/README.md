# @async-fn/jest

![Test status](https://github.com/team-igniter-from-houston-inc/async-fn/workflows/Jest/badge.svg) [![npm version](https://badge.fury.io/js/%40async-fn%2Fjest.svg)](https://badge.fury.io/js/%40async-fn%2Fjest) [![Gitter](https://badges.gitter.im/async-fn/community.svg)](https://gitter.im/async-fn/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![asyncFn](https://raw.githubusercontent.com/team-igniter-from-houston-inc/async-fn/master/logo.png)

**asyncFn** for jest provides additional methods to jest.fn to introduce "**late resolve**" for the promises returned.

This simplifies async unit testing by allowing tests that read chronologically, **like a story**, and do not require excessive test setup to know beforehand how async mocks are supposed to behave in each scenario.

It has **100% unit test coverage**, and 3+ years of focused **production use** with high **developer satisfaction**.

asyncFn is also **integration-tested** for combinations of recent OS-, node- and mocking framework -versions.

## How to install

```
$ npm install --save-dev @async-fn/jest
```
## Tutorial

See tutorial [here](https://medium.com/houston-io/how-to-unit-test-asynchronous-code-for-javascript-in-2020-41c124be2552).

## Examples

### Late resolve for calls to a mock to make tests read like a story

```javascript
import asyncFn from '@async-fn/jest';

it('given called, a result can be resolved *after* the mock is called', async () => {
  const mockFunction = asyncFn();
  const promise = mockFunction();

  // Note how we resolve the returned promise *after* it is called.
  // This permits us to write our tests so that they read like a story.
  await mockFunction.resolve('some-value');

  const actual = await promise;
  expect(actual).toBe('some-value');
});
```

### Late resolve for multiple calls to a mock

```javascript
import asyncFn from '@async-fn/jest';

it('given called multiple times, the results can be resolved *after* the mock was called', async () => {
  const mockFunction = asyncFn();

  const promise = Promise.all([mockFunction(), mockFunction(), mockFunction()]);

  await mockFunction.resolve('some-first-value');
  await mockFunction.resolve('some-second-value');
  await mockFunction.resolve('some-third-value');

  const actual = await promise;

  expect(actual).toEqual([
    'some-first-value',
    'some-second-value',
    'some-third-value',
  ]);
});
```

### Awaiting for coincidences of resolved calls

```javascript
import asyncFn from '@async-fn/jest';

it('can be awaited to test the coincidences of resolve', async () => {
  const mockFunction = asyncFn();

  let coincidenceHasHappened = false;

  mockFunction()
    .then()
    .then()
    .then(() => {
      coincidenceHasHappened = true;
    });

  await mockFunction.resolve();

  expect(coincidenceHasHappened).toBe(true);
});
```

### Late rejection

```javascript
import asyncFn from '@async-fn/jest';

it('can be rejected with a rejection', () => {
  const mockFunction = asyncFn();
  const promise = mockFunction();

  mockFunction.reject('some-rejection');

  return expect(promise).rejects.toBe('some-rejection');
});
```

### The other stuff jest.fn does

```javascript
import asyncFn from '@async-fn/jest';

it('does what jest.fn does', () => {
  const mockFunction = asyncFn();

  mockFunction('some-argument', 'some-other-argument');

  expect(mockFunction).toHaveBeenCalledWith(
    'some-argument',
    'some-other-argument',
  );
});
```

## More examples

Check out the [unit tests](https://github.com/team-igniter-from-houston-inc/async-fn/blob/master/packages/core/test-utils/itWorksAsAsyncFn.js).

## Availability

Currently asyncFn is also available for [sinon](https://www.npmjs.com/package/@async-fn/sinon).

## Who are we?

asyncFn is lovingly crafted by Your pals at **Team: Igniter from [Houston Inc. Consulting](https://houston-inc.com)**.

We are a software development team of **friends**, with proven tradition in professional excellence. We specialize in holistic rapid deployments without sacrificing quality.

Come say hi at [Gitter](https://gitter.im/async-fn/community), [email](mailto:igniter@houston-inc.com) us, or check out the [team's website](https://team.igniter.houston.io). We just might be open to hiring ;)
