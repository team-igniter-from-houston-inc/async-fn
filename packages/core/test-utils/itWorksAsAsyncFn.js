import flushMicroAndMacroTasks from '../src/flushMicroAndMacroTasks';

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

    it('given not called, when still tried to reject last call, throws', () => {
      expect(() => {
        mockFunctionInstance.rejectLastCall();
      }).toThrow('Tried to reject an asyncFn call that has not been made yet.');
    });

    it('given not called, when still tried to resolve last call, throws', () => {
      expect(() => {
        mockFunctionInstance.resolveLastCall();
      }).toThrow(
        'Tried to resolve an asyncFn call that has not been made yet.',
      );
    });

    it('given not called, when still tried to resolve first call, throws', () => {
      expect(() => {
        mockFunctionInstance.resolveFirstUnresolvedCall();
      }).toThrow(
        'Tried to resolve an asyncFn call that has not been made yet.',
      );
    });

    it('given called multiple times, when resolved multiple times, all returned promises resolve with resolution specific values', async () => {
      const firstPromise = mockFunctionInstance();
      const secondPromise = mockFunctionInstance();
      const thirdPromise = mockFunctionInstance();

      mockFunctionInstance.resolveFirstUnresolvedCall('some-first-value');
      mockFunctionInstance.resolveFirstUnresolvedCall('some-second-value');
      mockFunctionInstance.resolveFirstUnresolvedCall('some-third-value');

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

        await mockFunctionInstance.resolveLastCall('foo');

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

        await mockFunctionInstance.resolveLastCall('foo');

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

        await mockFunctionInstance.resolveLastCall('foo');

        expect(actual).toBe('foo');
      });

      it('does not resolve all the way in chained then-calls if a non-resolved native promise is encountered', async () => {
        const callbackBeforeNonResolvedPromise = jest.fn();
        const callbackAfterNonResolvedPromise = jest.fn();

        promise
          .then((x) => x)
          .then(callbackBeforeNonResolvedPromise)
          .then(() => new Promise(() => {}))
          .then(callbackAfterNonResolvedPromise);

        await mockFunctionInstance.resolveLastCall('some-value');

        expect(callbackBeforeNonResolvedPromise).toHaveBeenCalledWith(
          'some-value',
        );
        expect(callbackAfterNonResolvedPromise).not.toHaveBeenCalled();
      });

      it('resolves so that asynchronous Jest asserts work using returned promise', () => {
        mockFunctionInstance.resolveLastCall('foo');

        return expect(promise).resolves.toBe('foo');
      });

      it('resolves so that asynchronous Jest asserts work using the done-function', (done) => {
        mockFunctionInstance.resolveLastCall('foo');

        promise
          .then((value) => {
            expect(value).toBe('foo');
          })
          .then(done);
      });

      it('resolves so that async/await works', async () => {
        mockFunctionInstance.resolveLastCall('foo');

        const actual = await promise;
        expect(actual).toBe('foo');
      });

      it('rejects with error', (done) => {
        promise.catch((e) => {
          expect(e).toBe('some rejection');
          done();
        });

        mockFunctionInstance.rejectLastCall('some rejection');
      });
    });
  });
};
