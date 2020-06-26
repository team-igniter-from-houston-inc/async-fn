export default ({ getFn, flushPendingPromises }) => () => {
  const callStack = [];

  const asyncFn = getFn(() => {
    let resolve;
    let reject;

    const callPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    callStack.push({
      resolve: (...rest) => {
        resolve(...rest);
        return flushPendingPromises();
      },
      reject: (...rest) => {
        reject(...rest);
        return flushPendingPromises();
      },
    });

    return callPromise;
  });

  asyncFn.resolveLastCall = (...rest) => {
    const lastCall = callStack.pop();

    if (!lastCall) {
      throw new Error(
        'Tried to resolve an asyncFn call that has not been made yet.',
      );
    }

    return lastCall.resolve(...rest);
  };

  asyncFn.rejectLastCall = (...rest) => {
    const lastCall = callStack.pop();

    if (!lastCall) {
      throw new Error(
        'Tried to reject an asyncFn call that has not been made yet.',
      );
    }

    return lastCall.reject(...rest);
  };

  asyncFn.resolveFirstUnresolvedCall = (...rest) => {
    const firstCall = callStack.shift();

    if (!firstCall) {
      throw new Error(
        'Tried to resolve an asyncFn call that has not been made yet.',
      );
    }

    return firstCall.resolve(...rest);
  };

  return asyncFn;
};
