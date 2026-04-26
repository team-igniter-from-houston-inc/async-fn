# @async-fn/bun — LLM Usage

> Late-resolve async mocks for Bun. `asyncFn()` returns a `mock`-compatible mock (from `bun:test`) whose returned promise can be resolved or rejected from the test body — *after* the system under test has called the mock. This lets tests read chronologically.

## Install

```
bun add --dev @async-fn/bun
```

Peer dependency: `bun >= 1.0.0`. ESM-only (`"type": "module"`).

## Import

```javascript
import asyncFn from '@async-fn/bun';
```

## API

`asyncFn<TFn>()` — Returns a mock with no preset behavior. Takes no arguments.

The returned mock is a `Mock<TFn>` from `bun:test`, extended with three methods:

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

### Use bun:test's native assertions

`bun:test` re-exports the Jest API, so Jest-style matchers work:

```javascript
const mockFunction = asyncFn();
mockFunction('arg1', 'arg2');
expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
```

## Do not

- **Do not** call `mockImplementation`, `mockImplementationOnce`, `mockReturnValue`, or `mockReturnValueOnce` on an `asyncFn()` mock. They are intentionally blocked — they contradict the late-resolve paradigm. Use `resolve` / `reject` instead.
- **Do not** pass arguments to `asyncFn()`. It throws.

## TypeScript

Types ship at `./src/asyncFnForBun.d.ts`. `asyncFn<TFn>()` returns `AsyncFnMock<TFn>` — `Mock<TFn>` (from `bun:test`) intersected with `{ resolve, reject, resolveSpecific }`. Pass the function signature you want to mock as the type parameter:

```typescript
const fetchUser = asyncFn<(id: string) => Promise<User>>();
const promise = fetchUser('alice');
await fetchUser.resolve({ id: 1, name: 'alice' });
```
