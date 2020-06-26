import asyncFnForJest from './asyncFnForJest';
import itWorksAsAsyncFn from './itWorksAsAsyncFn';

describe('asyncFn with jest mocks', () => {
  it('returns a Jest mock function', async () => {
    const mockFunctionInstance = asyncFnForJest();

    expect(jest.isMockFunction(mockFunctionInstance));
  });

  describe('given "modern" fake timers', () => {
    beforeEach(() => {
      jest.useFakeTimers('modern');
    });

    itWorksAsAsyncFn(asyncFnForJest);
  });

  describe('given "legacy" fake timers', () => {
    beforeEach(() => {
      jest.useFakeTimers('legacy');
    });

    itWorksAsAsyncFn(asyncFnForJest);
  });

  describe('given real fake timers', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    itWorksAsAsyncFn(asyncFnForJest);
  });

  describe('given no timers', () => {
    itWorksAsAsyncFn(asyncFnForJest);
  });
});
