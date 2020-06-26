import asyncFnForSinon from './asyncFnForSinon';
import sinon from 'sinon';
import itWorksAsAsyncFn from '@async-fn/core/src/itWorksAsAsyncFn';

describe('asyncFn with sinon spies', () => {
  it('returns a sinon spy function', async () => {
    const mockFunctionInstance = asyncFnForSinon();

    expect(mockFunctionInstance.constructor).toBe(sinon.spy().constructor);
  });

  describe('given fake timers', () => {
    beforeEach(() => {
      sinon.useFakeTimers();
    });

    itWorksAsAsyncFn(asyncFnForSinon);
  });

  describe('given no timers', () => {
    itWorksAsAsyncFn(asyncFnForSinon);
  });
});
