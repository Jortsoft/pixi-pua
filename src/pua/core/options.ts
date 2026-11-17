import type { PuaEnd, PuaOptions } from '../types.js';

export function resolveEnd<O extends PuaOptions>(end: PuaEnd<O> | undefined): O {
  if (typeof end === 'function') return { onComplete: end } as O;
  return (end ?? {}) as O;
}
