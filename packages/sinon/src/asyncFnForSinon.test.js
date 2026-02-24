import sinon from 'sinon';
import itWorksAsAsyncFn from '@async-fn/core/test-utils/itWorksAsAsyncFn';

import asyncFnForSinon from './asyncFnForSinon';

const fakeTimerConfig = {
  toFake: [
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'setImmediate',
    'clearImmediate',
    'Date',
  ],
};

describe('asyncFn with sinon spies', () => {
  it('returns a sinon spy function', async () => {
    const mockFunctionInstance = asyncFnForSinon();

    expect(mockFunctionInstance.constructor).toBe(sinon.spy().constructor);
  });

  describe('given fake timers', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers(fakeTimerConfig);
    });

    afterEach(() => {
      clock.restore();
    });

    itWorksAsAsyncFn(asyncFnForSinon);
  });

  describe('given no timers', () => {
    itWorksAsAsyncFn(asyncFnForSinon);
  });
});
