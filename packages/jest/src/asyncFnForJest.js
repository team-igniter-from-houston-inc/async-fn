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
  mockFunctionInstance.mockReturnValue = throwMockImplementationUsageError;
  mockFunctionInstance.mockReturnValueOnce = throwMockImplementationUsageError;

  return mockFunctionInstance;
};

const throwMockImplementationUsageError = () => {
  throw new Error(mockImplementationUsageErrorMessage);
};
