import {
  asyncFnFor,
  mockImplementationUsageErrorMessage,
} from '@async-fn/core';

import { mock } from 'bun:test';

export default (...args) => {
  const mockFunctionInstance = asyncFnFor({
    mockFunctionFactory: mock,
  })(...args);

  // bun:test defines these as non-writable, so reassignment via plain
  // property access throws — redefine them instead.
  for (const name of [
    'mockImplementation',
    'mockImplementationOnce',
    'mockReturnValue',
    'mockReturnValueOnce',
  ]) {
    Object.defineProperty(mockFunctionInstance, name, {
      configurable: true,
      writable: true,
      value: throwMockImplementationUsageError,
    });
  }

  return mockFunctionInstance;
};

const throwMockImplementationUsageError = () => {
  throw new Error(mockImplementationUsageErrorMessage);
};
