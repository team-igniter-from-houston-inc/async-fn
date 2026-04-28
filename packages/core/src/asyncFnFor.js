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

const callStack = Symbol('callStack');

export default (options) =>
  (...args) => {
    const { mockFunctionFactory, callstackLocation = (mockFn) => mockFn } =
      options;
    if (args.length > 0) {
      throw new Error(mockImplementationUsageErrorMessage);
    }

    const impl = (...callArguments) => {
      let resolve;
      let reject;

      const callPromise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });

      getCalls().push({
        callArguments,

        resolve: (resolvedValue) => {
          resolve(resolvedValue);
          return flushMicroAndMacroTasks();
        },

        reject: (rejectedValue) => {
          reject(rejectedValue);
          return flushMicroAndMacroTasks();
        },
      });

      return callPromise;
    };
    const asyncFn = mockFunctionFactory(impl);
    const getCalls = () =>
      callstackLocation(asyncFn)[callStack] ??
      Object.defineProperty(callstackLocation(asyncFn), callStack, {
        configurable: false,
        enumerable: false,
        value: [],
      })[callStack];

    asyncFn.reject = (rejectedValue) => {
      const oldestUnresolvedCall = getCalls().shift();

      if (!oldestUnresolvedCall) {
        throw new Error(
          'Tried to reject an asyncFn call that has not been made yet.',
        );
      }

      return oldestUnresolvedCall.reject(rejectedValue);
    };

    asyncFn.resolve = (resolvedValue) => {
      const oldestUnresolvedCall = getCalls().shift();

      if (!oldestUnresolvedCall) {
        throw new Error(
          'Tried to resolve an asyncFn call that has not been made yet.',
        );
      }

      return oldestUnresolvedCall.resolve(resolvedValue);
    };

    asyncFn.resolveSpecific = (predicateThing, resolvedValue) => {
      const predicate = isFunction(predicateThing)
        ? predicateThing
        : matches(predicateThing);

      return pipeline(
        getCalls(),

        mutatingRemove(flow(get('callArguments'), predicate)),

        tap((callsToBeResolved) => {
          if (callsToBeResolved.length === 0) {
            throw new Error(
              'Tried to resolve specific asyncFn call that could not be found. Calls:\n' +
                JSON.stringify(getCalls().map(get('callArguments')), null, 2),
            );
          }
        }),

        map((callToBeResolved) => callToBeResolved.resolve(resolvedValue)),
        Promise.all.bind(Promise),
      );
    };

    return asyncFn;
  };
