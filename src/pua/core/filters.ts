import type { Filter } from 'pixi.js';
import type { EasingFn, PuaCallback, PuaTarget } from '../types.js';
import { run } from './engine.js';
import { shaderFilter } from './compat.js';
import type { ShaderFilter, Uniforms } from './compat.js';

export interface FilterRun {
  target: PuaTarget;
  filter: Filter;
  duration: number;
  delay?: number;
  loop?: boolean;
  timing?: EasingFn;
  onUpdate: (progress: number) => void;
  onComplete?: PuaCallback;
}

const puaFilters = new WeakMap<PuaTarget, Filter>();

export function createFilter(fragment: string, uniforms: Uniforms, padding = 0): ShaderFilter {
  return shaderFilter(fragment, uniforms, padding);
}

export function rgb(color: number): number[] {
  return [((color >> 16) & 255) / 255, ((color >> 8) & 255) / 255, (color & 255) / 255];
}

// The engine stops the previous filter animation first (which detaches its filter), then the new filter is attached.
export function runFilter({ target, filter, duration, delay, loop, timing, onUpdate, onComplete }: FilterRun): void {
  run({
    target,
    channel: 'filter',
    duration,
    delay,
    loop,
    timing,
    onUpdate,
    onStop: () => detachFilter(target, filter),
    onComplete
  });
  attachFilter(target, filter);
}

export function attachFilter(target: PuaTarget, filter: Filter): void {
  const previous = puaFilters.get(target);
  if (previous) detachFilter(target, previous);
  puaFilters.set(target, filter);
  target.filters = [...(target.filters ?? []), filter];
}

export function detachFilter(target: PuaTarget, filter: Filter): void {
  if (puaFilters.get(target) === filter) puaFilters.delete(target);
  const remaining = (target.filters ?? []).filter((f) => f !== filter);
  target.filters = remaining.length > 0 ? remaining : null;
}
