declare module '@async-fn/jest' {
  import type { MockInstance } from 'jest-mock';

  type AsyncFnMock<
    TToBeMocked extends (...args: unknown[]) => unknown,
    TArguments extends Parameters<TToBeMocked> = Parameters<TToBeMocked>,
    TResolve extends ReturnType<TToBeMocked> = ReturnType<TToBeMocked>
  > = MockInstance<(TArguments) => Promise<TResolve>, TArguments> & {
    resolve: (resolvedValue: TResolve) => Promise<void>;
    reject: (rejectValue?: any) => Promise<void>;
  } & ((...args: TArguments) => Promise<TResolve>);

  export type { AsyncFnMock };

  export default function asyncFn<
    TToBeMocked extends (...args: unknown[]) => unknown
  >(): AsyncFnMock<TToBeMocked>;
}
