# @async-fn/sinon — LLM Usage

> Late-resolve async mocks for Sinon. `asyncFn()` returns a `sinon.spy()`-compatible mock whose returned promise can be resolved or rejected from the test body — *after* the system under test has called the mock. This lets tests read chronologically.

## Install

```
npm install --save-dev @async-fn/sinon
```

Peer dependency: `sinon ^9.0.2`.

## Import

```javascript
import asyncFn from '@async-fn/sinon';
```

## API

`asyncFn()` — Returns a mock with no preset behavior. Takes no arguments.

The returned mock is a `sinon.spy` extended with three methods:

- `mock.resolve(value?)` — Resolves the *oldest unresolved* call's promise with `value`. Returns a `Promise<void>` you should `await` so the resolution flushes.
- `mock.reject(error?)` — Rejects the oldest unresolved call. Returns `Promise<void>`.
- `mock.resolveSpecific(callFinder, value?)` — Resolves a specific call. `callFinder` is either a `PartialDeep` match of the call's arguments tuple or a predicate `(args) => boolean`.

Resolution order is FIFO across `resolve`/`reject` (each call is tracked in a queue).

## Canonical examples

### Resolve a single call

```javascript
const mockFunction = asyncFn();
const promise = mockFunction();
await mockFunction.resolve('some-value');
expect(await promise).toBe('some-value');
```

### Resolve multiple calls in order

```javascript
const mockFunction = asyncFn();
const promise = Promise.all([mockFunction(), mockFunction(), mockFunction()]);
await mockFunction.resolve('first');
await mockFunction.resolve('second');
await mockFunction.resolve('third');
expect(await promise).toEqual(['first', 'second', 'third']);
```

### Late rejection

```javascript
const mockFunction = asyncFn();
const promise = mockFunction();
mockFunction.reject('some-rejection');
await expect(promise).rejects.toBe('some-rejection');
```

### Resolve a specific call by argument match

```javascript
const mockFunction = asyncFn();
mockFunction('a'); mockFunction('b'); mockFunction('c');
await mockFunction.resolveSpecific(args => args[0] === 'b', 'value-for-b');
```

### Use Sinon's native assertions

The mock is a `sinon.spy`, so use sinon's matcher API — not Jest-style `toHaveBeenCalledWith`:

```javascript
const mockFunction = asyncFn();
mockFunction('arg1', 'arg2');
expect(mockFunction.calledWith('arg1', 'arg2')).toBe(true);
expect(mockFunction.callCount).toBe(1);
```

## Do not

- **Do not** pre-program return values on the spy (e.g. via `sinon.stub().resolves(...)`). Use `resolve` / `reject` from the test body instead — that is the whole point of asyncFn.
- **Do not** pass arguments to `asyncFn()`. It throws.

## TypeScript

`@async-fn/sinon` does **not** ship its own type definitions. The runtime API matches `@async-fn/jest` and `@async-fn/vitest`: a sinon spy with `resolve`, `reject`, and `resolveSpecific` methods added.
