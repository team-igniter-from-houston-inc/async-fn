import asyncFn from './asyncFn';

describe('asyncFn', () => {
  it('returns a Jest mock function', () => {
    const mockFunction = asyncFn();

    expect(jest.isMockFunction(mockFunction));
  });

  describe('the mock function', () => {
    let mockFunction;

    beforeEach(() => {
      mockFunction = asyncFn();
    });

    it('returns a promise (or at least a thenable)', () => {
      expect(mockFunction().then).toEqual(expect.any(Function));
    });

    it('given not called, when still tried to reject last call, throws', () => {
      expect(() => {
        mockFunction.rejectLastCall();
      }).toThrow('Tried to reject an asyncFn call that has not been made yet.');
    });

    it('given not called, when still tried to resolve last call, throws', () => {
      expect(() => {
        mockFunction.resolveLastCall();
      }).toThrow(
        'Tried to resolve an asyncFn call that has not been made yet.',
      );
    });

    it('given not called, when still tried to resolve first call, throws', () => {
      expect(() => {
        mockFunction.resolveFirstUnresolvedCall();
      }).toThrow(
        'Tried to resolve an asyncFn call that has not been made yet.',
      );
    });

    it('given called multiple times, when resolved multiple times, all returned promises resolve with resolution specific values', async () => {
      const firstPromise = mockFunction();
      const secondPromise = mockFunction();
      const thirdPromise = mockFunction();

      mockFunction.resolveFirstUnresolvedCall('some-first-value');
      mockFunction.resolveFirstUnresolvedCall('some-second-value');
      mockFunction.resolveFirstUnresolvedCall('some-third-value');

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
        promise = mockFunction();
      });

      it('resolves using the mock function used to create the promise itself', async () => {
        let actual;
        promise.then(x => {
          actual = x;
        });

        await mockFunction.resolveLastCall('foo');

        expect(actual).toBe('foo');
      });

      it('does not resolve without using the mock function', () => {
        let actual;

        promise.then(x => {
          actual = x;
        });

        expect(actual).toBe(undefined);
      });

      it('resolves multiple levels of chained then-calls containing synchronous functions', async () => {
        let actual;
        promise
          .then(x => x)
          .then(x => x)
          .then(x => {
            actual = x;
          });

        await mockFunction.resolveLastCall('foo');

        expect(actual).toBe('foo');
      });

      it('resolves chained then-calls containing an already resolved native promise', async () => {
        let actual;
        promise
          .then(x => x)
          .then(x => Promise.resolve(x))
          .then(x => {
            actual = x;
          });

        await mockFunction.resolveLastCall('foo');

        expect(actual).toBe('foo');
      });

      it('does not resolve all the way in chained then-calls if a non-resolved native promise is encountered', async () => {
        let actual;
        promise
          .then(x => x)
          .then(x => {
            actual = x;
          })
          .then(() => new Promise(x => {}))
          .then(() => {
            actual = 'Unwanted value';
          });

        await mockFunction.resolveLastCall('foo');

        expect(actual).toBe('foo');
      });

      it('resolves so that asynchronous Jest asserts work using returned promise', () => {
        mockFunction.resolveLastCall('foo');

        return expect(promise).resolves.toBe('foo');
      });

      it('resolves so that asynchronous Jest asserts work using the done-function', done => {
        mockFunction.resolveLastCall('foo');

        promise
          .then(value => {
            expect(value).toBe('foo');
          })
          .then(done);
      });

      it('resolves so that async/await works', async () => {
        mockFunction.resolveLastCall('foo');

        const actual = await promise;
        expect(actual).toBe('foo');
      });

      it('rejects with error', done => {
        promise.catch(e => {
          expect(e).toBe('some rejection');
          done();
        });

        mockFunction.rejectLastCall('some rejection');
      });
    });
  });
});
