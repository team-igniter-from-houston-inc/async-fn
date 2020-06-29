import flushMicroAndMacroTasks from './flushMicroAndMacroTasks';
import mockImplementationUsageErrorMessage from './mockImplementationUsageErrorMessage';

export default ({ mockFunctionFactory }) => (...args) => {
  if (args.length > 0) {
    throw new Error(mockImplementationUsageErrorMessage);
  }

  const callStack = [];

  const asyncFn = mockFunctionFactory(() => {
    let resolve;
    let reject;

    const callPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    callStack.push({
      resolve: (...rest) => {
        resolve(...rest);
        return flushMicroAndMacroTasks();
      },
      reject: (...rest) => {
        reject(...rest);
        return flushMicroAndMacroTasks();
      },
    });

    return callPromise;
  });

  asyncFn.reject = (...rest) => {
    const oldestUnresolvedCall = callStack.shift();

    if (!oldestUnresolvedCall) {
      throw new Error(
        'Tried to reject an asyncFn call that has not been made yet.',
      );
    }

    return oldestUnresolvedCall.reject(...rest);
  };

  asyncFn.resolve = (...rest) => {
    const oldestUnresolvedCall = callStack.shift();

    if (!oldestUnresolvedCall) {
      throw new Error(
        'Tried to resolve an asyncFn call that has not been made yet.',
      );
    }

    return oldestUnresolvedCall.resolve(...rest);
  };

  return asyncFn;
};
