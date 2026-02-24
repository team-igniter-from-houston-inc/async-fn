import { describe, it, expect, beforeEach, vi } from 'vitest';
import itWorksAsAsyncFn from '@async-fn/core/test-utils/itWorksAsAsyncFn';

import asyncFnForVitest from './asyncFnForVitest';

describe('asyncFn with vitest mocks', () => {
  it('returns a vitest mock function', async () => {
    const mockFunctionInstance = asyncFnForVitest();

    expect(vi.isMockFunction(mockFunctionInstance)).toBe(true);
  });

  describe('given fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    itWorksAsAsyncFn(asyncFnForVitest);
  });

  describe('given real timers', () => {
    beforeEach(() => {
      vi.useRealTimers();
    });

    itWorksAsAsyncFn(asyncFnForVitest);
  });

  describe('given no timers', () => {
    itWorksAsAsyncFn(asyncFnForVitest);
  });

  [
    'mockImplementation',
    'mockImplementationOnce',
    'mockReturnValue',
    'mockReturnValueOnce',
  ].forEach((restrictedMethodName) => {
    it(`when setting mock implementation with "${restrictedMethodName}", throws`, () => {
      const mockFunctionInstance = asyncFnForVitest();

      expect(
        () => void mockFunctionInstance[restrictedMethodName](() => {}),
      ).toThrow(
        'Using a mock implementation with asyncFn is not supported for making no sense.',
      );
    });
  });
});
