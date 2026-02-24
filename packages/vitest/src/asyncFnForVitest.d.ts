declare module '@async-fn/vitest' {
  import type { PartialDeep } from 'type-fest';
  import type { Mock } from 'vitest';

  type TentativeTuple<T> = T extends undefined | void ? [undefined?] : [T];

  type AsyncFnMock<TToBeMocked extends (...args: any[]) => any> =
    Mock<(...args: Parameters<TToBeMocked>) => ReturnType<TToBeMocked>> & {
      resolve: (
        ...resolvedValue: TentativeTuple<
          ReturnType<TToBeMocked> | Awaited<ReturnType<TToBeMocked>>
        >
      ) => Promise<void>;

      resolveSpecific: (
        callFinder:
          | PartialDeep<Parameters<TToBeMocked>>
          | ((parameters: Parameters<TToBeMocked>) => boolean),
        ...resolvedValue: TentativeTuple<
          ReturnType<TToBeMocked> | Awaited<ReturnType<TToBeMocked>>
        >
      ) => Promise<void>;

      reject: (rejectValue?: any) => Promise<void>;
    };
  export type { AsyncFnMock };

  export default function asyncFn<
    TToBeMocked extends (...args: any[]) => any,
  >(): AsyncFnMock<TToBeMocked>;
}
