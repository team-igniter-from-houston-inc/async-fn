import './some-module.mock';
import * as SomeModule from './some-module';

const someAsyncFunctionMock = SomeModule.someAsyncFunction;

describe('given some instance which calls a mocked function', () => {
  let topLevelFn;

  beforeEach(() => {
    topLevelFn = vi.fn(async (...args) => someAsyncFunctionMock(...args));
  });

  describe('when called in a beforeEach within a vitest describe', () => {
    let callPromise;

    beforeEach(() => {
      callPromise = topLevelFn('some-arg');
    });

    it('calls the mock function', () => {
      expect(someAsyncFunctionMock).toHaveBeenCalledExactlyOnceWith('some-arg');
    });

    it('has not resolved yet', () => {
      expect(topLevelFn).not.toHaveResolved();
    });

    describe('when the mock resolves', () => {
      beforeEach(async () => {
        await someAsyncFunctionMock.resolve('some-resolved-value');
      });

      it('resolves the vitest fn tracker', () => {
        expect(topLevelFn).toHaveResolvedWith('some-resolved-value');
      });

      it('resolves the actual promise returned too', async () => {
        expect(await callPromise).toBe('some-resolved-value');
      });
    });
  });
});
