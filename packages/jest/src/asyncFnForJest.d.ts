/// <reference types="jest" />
declare module "@async-fn/jest" {
  type Awaited<TMaybePromise> = TMaybePromise extends PromiseLike<infer TValue> ? TValue : TMaybePromise;

  type AsyncFnMock<
    TMockedFunction extends Function,
    TArguments = Parameters<TMockedFunction>,
    TResolve = ReturnType<TMockedFunction>,
  > = jest.MockInstance<TResolve, TArguments> & {
    resolve: (resolvedValue?: Awaited<TResolve>) => Promise<void>;
    reject: (rejectValue?: any) => Promise<void>;
  } & ((...args: TArguments) => Promise<TResolve>);

  export type { AsyncFnMock };

  export default function asyncFn<TResolve, TArguments>(): AsyncFnMock<
    TResolve,
    TArguments
  >;
}
