import sinon from 'sinon';
import { asyncFnFor } from '@async-fn/core';

export default asyncFnFor({
  mockFunctionFactory: sinon.spy,
});
