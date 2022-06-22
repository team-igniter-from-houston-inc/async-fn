declare module '@async-fn/jest' {
  import type { PartialDeep } from 'type-fest';

  type TentativeTuple<T> = T extends undefined ? [undefined?] : [T];

  type AsyncFnMock<TToBeMocked extends (...args: any[]) => any> = jest.MockedFunction<TToBeMocked> & {
    resolve: (...resolvedValue: TentativeTuple<ReturnType<TToBeMocked>>) => Promise<void>;

    resolveSpecific: (
      callFinder:
        | PartialDeep<Parameters<TToBeMocked>>
        | ((parameters: Parameters<TToBeMocked>) => boolean),
      ...resolvedValue: TentativeTuple<ReturnType<TToBeMocked>>
    ) => Promise<void>;

    reject: (rejectValue?: any) => Promise<void>;
  };
  export type { AsyncFnMock };

  export default function asyncFn<
    TToBeMocked extends (...args: any[]) => any,
  >(): AsyncFnMock<TToBeMocked>;
}
