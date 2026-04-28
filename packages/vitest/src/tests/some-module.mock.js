import { vi } from 'vitest';
import asyncFnForVitest from '../asyncFnForVitest';

vi.mock(import('./some-module'), async (importOriginal) => ({
  ...(await importOriginal()),
  someAsyncFunction: asyncFnForVitest(),
}));
