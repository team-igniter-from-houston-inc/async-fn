import { setImmediate as flushMicroTasks } from 'timers';

export default () => new Promise(flushMicroTasks);
