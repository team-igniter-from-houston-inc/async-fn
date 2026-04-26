import { describe, it, expect, beforeEach, jest } from 'bun:test';
import itWorksAsAsyncFn from '@async-fn/core/test-utils/itWorksAsAsyncFn';

import asyncFnForBun from './asyncFnForBun';

describe('asyncFn with bun mocks', () => {
  it('returns a bun mock function', async () => {
    const mockFunctionInstance = asyncFnForBun();

    expect(mockFunctionInstance.mock).toBeDefined();
    expect(mockFunctionInstance.mock.calls).toEqual([]);
  });

  describe('given fake timers', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    itWorksAsAsyncFn(asyncFnForBun);
  });

  describe('given real timers', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    itWorksAsAsyncFn(asyncFnForBun);
  });

  describe('given no timers', () => {
    itWorksAsAsyncFn(asyncFnForBun);
  });

  [
    'mockImplementation',
    'mockImplementationOnce',
    'mockReturnValue',
    'mockReturnValueOnce',
  ].forEach((restrictedMethodName) => {
    it(`when setting mock implementation with "${restrictedMethodName}", throws`, () => {
      const mockFunctionInstance = asyncFnForBun();

      expect(
        () => void mockFunctionInstance[restrictedMethodName](() => {}),
      ).toThrow(
        'Using a mock implementation with asyncFn is not supported for making no sense.',
      );
    });
  });
});
