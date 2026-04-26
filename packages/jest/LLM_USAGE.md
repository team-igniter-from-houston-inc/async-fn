# @async-fn/jest — LLM Usage

> Late-resolve async mocks for Jest. `asyncFn()` returns a `jest.fn()`-compatible mock whose returned promise can be resolved or rejected from the test body — *after* the system under test has called the mock. This lets tests read chronologically.

## Install

```
npm install --save-dev @async-fn/jest
```

Peer dependency: `jest >= 24.9.0`.

## Import

```javascript
import asyncFn from '@async-fn/jest';
```

## API

`asyncFn<TFn>()` — Returns a mock with no preset behavior. Takes no arguments.

The returned mock is a `jest.MockedFunction<TFn>` extended with three methods:

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

### Use Jest's native assertions

```javascript
const mockFunction = asyncFn();
mockFunction('arg1', 'arg2');
expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
```

## Do not

- **Do not** call `mockImplementation`, `mockImplementationOnce`, `mockReturnValue`, or `mockReturnValueOnce` on an `asyncFn()` mock. They are intentionally blocked — they contradict the late-resolve paradigm. Use `resolve` / `reject` instead.
- **Do not** pass arguments to `asyncFn()`. It throws.

## TypeScript

Types ship at `./src/asyncFnForJest.d.ts`. `asyncFn<TFn>()` returns `AsyncFnMock<TFn>` — `jest.MockedFunction<TFn>` intersected with `{ resolve, reject, resolveSpecific }`. Pass the function signature you want to mock as the type parameter:

```typescript
const fetchUser = asyncFn<(id: string) => Promise<User>>();
const promise = fetchUser('alice');
await fetchUser.resolve({ id: 1, name: 'alice' });
```
