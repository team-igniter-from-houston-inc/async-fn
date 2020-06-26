import { setImmediate as flushMicroTasks } from 'timers';
import sinon from 'sinon';
import asyncFnFor from './asyncFnFor';

const flushMicroAndMacroTasks = () => new Promise(flushMicroTasks);

export default asyncFnFor({
  getFn: sinon.spy,
  flushPendingPromises: flushMicroAndMacroTasks,
});
