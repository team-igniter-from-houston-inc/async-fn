import {
  asyncFnFor,
  mockImplementationUsageErrorMessage,
} from '@async-fn/core';

export default (...args) => {
  const mockFunctionInstance = asyncFnFor({
    mockFunctionFactory: jest.fn,
  })(...args);

  mockFunctionInstance.mockImplementation = throwMockImplementationUsageError;
  mockFunctionInstance.mockImplementationOnce = throwMockImplementationUsageError;

  return mockFunctionInstance;
};

const throwMockImplementationUsageError = () => {
  throw new Error(mockImplementationUsageErrorMessage);
};
