import sinon from 'sinon';
import asyncFnFor from './asyncFnFor';

export default asyncFnFor({
  getFn: sinon.spy,
});
