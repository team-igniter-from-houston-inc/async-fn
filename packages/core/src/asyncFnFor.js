import flushMicroAndMacroTasks from './flushMicroAndMacroTasks';
import mockImplementationUsageErrorMessage from './mockImplementationUsageErrorMessage';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import get from 'lodash/fp/get';
import remove from 'lodash/fp/remove';
import tap from 'lodash/fp/tap';
import isFunction from 'lodash/fp/isFunction';
import matches from 'lodash/fp/matches';

const pipeline = (data, ...functions) => flow(...functions)(data);
const mutatingRemove = remove.convert({ immutable: false });

export default ({ mockFunctionFactory }) => (...args) => {
  if (args.length > 0) {
    throw new Error(mockImplementationUsageErrorMessage);
  }

  const callStack = [];

  const asyncFn = mockFunctionFactory((...callArguments) => {
    let resolve;
    let reject;

    const callPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    callStack.push({
      callArguments,

      resolve: (...resolveArguments) => {
        resolve(...resolveArguments);
        return flushMicroAndMacroTasks();
      },

      reject: (...rejectArguments) => {
        reject(...rejectArguments);
        return flushMicroAndMacroTasks();
      },
    });

    return callPromise;
  });

  asyncFn.reject = (...rejectArguments) => {
    const oldestUnresolvedCall = callStack.shift();

    if (!oldestUnresolvedCall) {
      throw new Error(
        'Tried to reject an asyncFn call that has not been made yet.',
      );
    }

    return oldestUnresolvedCall.reject(...rejectArguments);
  };

  asyncFn.resolve = (...resolveArguments) => {
    const oldestUnresolvedCall = callStack.shift();

    if (!oldestUnresolvedCall) {
      throw new Error(
        'Tried to resolve an asyncFn call that has not been made yet.',
      );
    }

    return oldestUnresolvedCall.resolve(...resolveArguments);
  };

  asyncFn.resolveSpecific = (predicateThing, ...resolveArguments) => {
    const predicate = isFunction(predicateThing)
      ? predicateThing
      : matches(predicateThing);

    return pipeline(
      callStack,

      mutatingRemove(flow(get('callArguments'), predicate)),

      tap((callsToBeResolved) => {
        if (callsToBeResolved.length === 0) {
          throw new Error(
            'Tried to resolve specific asyncFn call that could not be found. Calls:\n' +
              JSON.stringify(callStack.map(get('callArguments')), null, 2),
          );
        }
      }),

      map((callToBeResolved) => callToBeResolved.resolve(...resolveArguments)),
      Promise.all.bind(Promise),
    );
  };

  return asyncFn;
};
