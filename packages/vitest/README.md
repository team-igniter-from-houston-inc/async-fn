# @async-fn/vitest

**asyncFn** for vitest provides additional methods to vi.fn to introduce "**late resolve**" for the promises returned.

This simplifies async unit testing by allowing tests that read chronologically, **like a story**, and do not require excessive test setup to know beforehand how async mocks are supposed to behave in each scenario.

## How to install

```
$ npm install --save-dev @async-fn/vitest
```

In your `vitest.config.js` ensure that you have the following configuration. This is required when using `vi.mock(<some-module>)`.

```js
export default defineConfig({
  test: {
    clearMocks: true,
  }
})
```

## Examples

### Late resolve for calls to a mock to make tests read like a story

```javascript
import asyncFn from '@async-fn/vitest';

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
import asyncFn from '@async-fn/vitest';

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

### Late rejection

```javascript
import asyncFn from '@async-fn/vitest';

it('can be rejected with a rejection', () => {
  const mockFunction = asyncFn();
  const promise = mockFunction();

  mockFunction.reject('some-rejection');

  return expect(promise).rejects.toBe('some-rejection');
});
```

### The other stuff vi.fn does

```javascript
import asyncFn from '@async-fn/vitest';

it('does what vi.fn does', () => {
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

asyncFn is also available for [jest](https://www.npmjs.com/package/@async-fn/jest) and [sinon](https://www.npmjs.com/package/@async-fn/sinon).
