import flushMicroAndMacroTasks from '../src/flushMicroAndMacroTasks';
import matches from 'lodash/fp/matches';

export default (asyncFn) => {
  it('when a mock function instance is created with arguments, throws', () => {
    expect(() => asyncFn('some-argument')).toThrow(
      'Using a mock implementation with asyncFn is not supported for making no sense.',
    );
  });

  describe('when a mock function instance is created without arguments', () => {
    let mockFunctionInstance;

    beforeEach(() => {
      mockFunctionInstance = asyncFn();
    });

    it('returns a promise (or at least a thenable)', () => {
      expect(mockFunctionInstance().then).toEqual(expect.any(Function));
    });

    it('given not called, but still tried to reject, throws', () => {
      expect(() => {
        mockFunctionInstance.reject();
      }).toThrow('Tried to reject an asyncFn call that has not been made yet.');
    });

    it('given not called, but still tried to resolve, throws', () => {
      expect(() => {
        mockFunctionInstance.resolve();
      }).toThrow(
        'Tried to resolve an asyncFn call that has not been made yet.',
      );
    });

    it('given called multiple times, when resolved multiple times with values, all returned promises resolve with the specified values', async () => {
      const firstPromise = mockFunctionInstance();
      const secondPromise = mockFunctionInstance();
      const thirdPromise = mockFunctionInstance();

      mockFunctionInstance.resolve('some-first-value');
      mockFunctionInstance.resolve('some-second-value');
      mockFunctionInstance.resolve('some-third-value');

      const results = await Promise.all([
        firstPromise,
        secondPromise,
        thirdPromise,
      ]);

      expect(results).toEqual([
        'some-first-value',
        'some-second-value',
        'some-third-value',
      ]);
    });

    it('given called multiple times, when resolving in specific calls, all returned promises resolve with the specified values', async () => {
      const firstPromise = mockFunctionInstance({ some: 'parameter' });
      const secondPromise = mockFunctionInstance({ some: 'other-parameter' });

      mockFunctionInstance.resolveSpecific(
        matches([{ some: 'other-parameter' }]),
        'some-second-value',
      );

      mockFunctionInstance.resolveSpecific(
        matches([{ some: 'parameter' }]),
        'some-first-value',
      );

      const results = await Promise.all([firstPromise, secondPromise]);

      expect(results).toEqual(['some-first-value', 'some-second-value']);
    });

    it('given called multiple times, when resolving multiple specific calls at the same time, all returned promises resolve with the specified values', async () => {
      const firstPromise = mockFunctionInstance({ some: 'parameter' });
      const secondPromise = mockFunctionInstance({ some: 'parameter' });

      mockFunctionInstance.resolveSpecific(
        matches([{ some: 'parameter' }]),
        'some-value',
      );

      const results = await Promise.all([firstPromise, secondPromise]);

      expect(results).toEqual(['some-value', 'some-value']);
    });

    it('given called multiple times and all calls are resolved specifically, when resolving latest call, throws for call being already resolved', async () => {
      mockFunctionInstance({ some: 'parameter' });
      mockFunctionInstance({ some: 'parameter' });

      mockFunctionInstance.resolveSpecific(
        matches([{ some: 'parameter' }]),
        'irrelevant',
      );

      return expect(() => {
        mockFunctionInstance.resolve();
      }).toThrow(
        'Tried to resolve an asyncFn call that has not been made yet.',
      );
    });

    it('when resolving specifically call that has not been made, throws', async () => {
      mockFunctionInstance({ some: 'parameter' }, 'some-second-parameter');
      mockFunctionInstance('some-parameter-for-second-call');

      return expect(() => {
        mockFunctionInstance.resolveSpecific(
          matches([{ some: 'other-parameter' }]),
          'irrelevant',
        );
      }).toThrow(
        `Tried to resolve specific asyncFn call that could not be found. Calls:
[
  [
    {
      \"some\": \"parameter\"
    },
    \"some-second-parameter\"
  ],
  [
    \"some-parameter-for-second-call\"
  ]
]`,
      );
    });

    describe('the returned promise', () => {
      let promise;

      beforeEach(() => {
        promise = mockFunctionInstance();
      });

      it('resolves using the mock function used to create the promise itself', async () => {
        let actual;
        promise.then((x) => {
          actual = x;
        });

        await mockFunctionInstance.resolve('foo');

        expect(actual).toBe('foo');
      });

      it('does not resolve without using the mock function', async () => {
        const callback = jest.fn();

        promise.then(callback);
        await flushMicroAndMacroTasks();

        expect(callback).not.toHaveBeenCalled();
      });

      it('resolves multiple levels of chained then-calls containing synchronous functions', async () => {
        let actual;

        promise
          .then((x) => x)
          .then((x) => x)
          .then((x) => {
            actual = x;
          });

        await mockFunctionInstance.resolve('foo');

        expect(actual).toBe('foo');
      });

      it('resolves chained then-calls containing an already resolved native promise', async () => {
        let actual;
        promise
          .then((x) => x)
          .then((x) => Promise.resolve(x))
          .then((x) => {
            actual = x;
          });

        await mockFunctionInstance.resolve('foo');

        expect(actual).toBe('foo');
      });

      it('given a non-resolved promise, does not resolve beyond the unresolved promise in a chain of then-calls', async () => {
        const callbackBeforeNonResolvedPromise = jest.fn();
        const callbackAfterNonResolvedPromise = jest.fn();

        promise
          .then((x) => x)
          .then(callbackBeforeNonResolvedPromise)
          .then(() => new Promise(() => {}))
          .then(callbackAfterNonResolvedPromise);

        await mockFunctionInstance.resolve('some-value');

        expect(callbackBeforeNonResolvedPromise).toHaveBeenCalledWith(
          'some-value',
        );

        expect(callbackAfterNonResolvedPromise).not.toHaveBeenCalled();
      });

      it('resolves so that asynchronous Jest asserts work using returned promise', () => {
        mockFunctionInstance.resolve('foo');

        return expect(promise).resolves.toBe('foo');
      });

      it('resolves so that asynchronous Jest asserts work using the done-function', (done) => {
        mockFunctionInstance.resolve('foo');

        promise
          .then((value) => {
            expect(value).toBe('foo');
          })
          .then(done);
      });

      it('resolves so that async/await works', async () => {
        mockFunctionInstance.resolve('foo');

        const actual = await promise;
        expect(actual).toBe('foo');
      });

      it('when rejected with error, rejects with the error', () => {
        mockFunctionInstance.reject('some rejection');

        return expect(promise).rejects.toBe('some rejection');
      });
    });
  });
};
