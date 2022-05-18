declare module '@async-fn/jest' {
  import type { PartialDeep } from 'type-fest';
  import type { MockInstance } from 'jest-mock';

  type TentativeTuple<T> = T extends undefined ? [undefined?] : [T];

  type AsyncFnMock<
    TToBeMocked extends (...args: any[]) => any,
    TArguments extends Parameters<TToBeMocked> = Parameters<TToBeMocked>,
    TResolve extends Awaited<ReturnType<TToBeMocked>> = Awaited<
      ReturnType<TToBeMocked>
    >,
  > = MockInstance<(arg: TArguments) => Promise<TResolve>, TArguments> & {
    resolve: (...resolvedValue: TentativeTuple<TResolve>) => Promise<void>;

    resolveSpecific: (
      callFinder:
        | PartialDeep<TArguments>
        | ((parameters: TArguments) => boolean),
      ...resolvedValue: TentativeTuple<TResolve>
    ) => Promise<void>;

    reject: (rejectValue?: any) => Promise<void>;
  } & ((...args: TArguments) => Promise<TResolve>);

  export type { AsyncFnMock };

  export default function asyncFn<
    TToBeMocked extends (...args: any[]) => any,
  >(): AsyncFnMock<TToBeMocked>;
}
