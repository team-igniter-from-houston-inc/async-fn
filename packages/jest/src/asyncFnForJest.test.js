import itWorksAsAsyncFn from '@async-fn/core/test-utils/itWorksAsAsyncFn';

import asyncFnForJest from './asyncFnForJest';

describe('asyncFn with jest mocks', () => {
  it('returns a Jest mock function', async () => {
    const mockFunctionInstance = asyncFnForJest();

    expect(jest.isMockFunction(mockFunctionInstance));
  });

  describe('given fake timers', () => {
    beforeEach(() => {
      jest.useFakeTimers({ doNotFake: ['performance'] });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    itWorksAsAsyncFn(asyncFnForJest);
  });

  describe('given real timers', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    itWorksAsAsyncFn(asyncFnForJest);
  });

  describe('given no timers', () => {
    itWorksAsAsyncFn(asyncFnForJest);
  });

  [
    'mockImplementation',
    'mockImplementationOnce',
    'mockReturnValue',
    'mockReturnValueOnce',
  ].forEach((restrictedMethodName) => {
    it(`when setting mock implementation with "${restrictedMethodName}", throws`, () => {
      const mockFunctionInstance = asyncFnForJest();

      expect(
        () => void mockFunctionInstance[restrictedMethodName](() => {}),
      ).toThrow(
        'Using a mock implementation with asyncFn is not supported for making no sense.',
      );
    });
  });
});
