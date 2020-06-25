import { setImmediate as flushMicroTasks } from 'timers';
import asyncFnFor from './asyncFnFor';

const flushMicroAndMacroTasks = () => new Promise(flushMicroTasks);

export default asyncFnFor({
  getFn: jest.fn,
  flushPendingPromises: flushMicroAndMacroTasks,
});
