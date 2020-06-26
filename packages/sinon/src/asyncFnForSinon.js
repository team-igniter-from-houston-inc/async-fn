import sinon from 'sinon';
import { asyncFnFor } from '@async-fn/core';

export default asyncFnFor({
  getFn: sinon.spy,
});
