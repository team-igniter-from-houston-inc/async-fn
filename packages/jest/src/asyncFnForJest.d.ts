/// <reference types="jest" />
declare module "@async-fn/jest" {
  type MockedAsyncFn<TArguments, TResolve, TReject = any> =
    Omit<jest.MockInstance<ReturnType<TResolve>, Parameters<TArguments>>,
      | "mockImplementation"
      | "mockImplementationOnce"
      | "mockReturnValue"
      | "mockReturnValueOnce"> &
    {
      resolve: (resolvedValue: TResolve) => Promise<void>,
      reject: (rejectValue: TReject) => Promise<void>
    } & ((...args: TArguments) => Promise<TResolve>);

  export type {MockedAsyncFn};

  export default function asyncFn<TArguments, TResolve, TReject = any>(): MockedAsyncFn<TArguments, TResolve, TReject>;
}
