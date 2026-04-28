import {
  asyncFnFor,
  mockImplementationUsageErrorMessage,
} from '@async-fn/core';

import { vi } from 'vitest';

export default (...args) => {
  const mockFunctionInstance = asyncFnFor({
    mockFunctionFactory: vi.fn,
    callstackLocation: (mockFn) => mockFn.mock.calls,
  })(...args);

  mockFunctionInstance.mockImplementation = throwMockImplementationUsageError;
  mockFunctionInstance.mockImplementationOnce = throwMockImplementationUsageError;
  mockFunctionInstance.mockReturnValue = throwMockImplementationUsageError;
  mockFunctionInstance.mockReturnValueOnce = throwMockImplementationUsageError;

  return mockFunctionInstance;
};

const throwMockImplementationUsageError = () => {
  throw new Error(mockImplementationUsageErrorMessage);
};
