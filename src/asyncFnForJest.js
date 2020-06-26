import asyncFnFor from './asyncFnFor';
import mockImplementationUsageErrorMessage from './mockImplementationUsageErrorMessage';

export default (...args) => {
  const mockFunctionInstance = asyncFnFor({
    getFn: jest.fn,
  })(...args);

  mockFunctionInstance.mockImplementation = throwMockImplementationUsageError;
  mockFunctionInstance.mockImplementationOnce = throwMockImplementationUsageError;

  return mockFunctionInstance;
};

const throwMockImplementationUsageError = () => {
  throw new Error(mockImplementationUsageErrorMessage);
};
