import type { PuaTarget } from '../types.js';
import { find } from './engine.js';

export type XY = { x: number; y: number };

const restScales = new WeakMap<PuaTarget, XY>();
const restPositions = new WeakMap<PuaTarget, XY>();
const restAlphas = new WeakMap<PuaTarget, number>();

// "Rest" = where the object settles once its current animation ends.
// Out-animations remember it so the matching In-animation can bring the object back.

export function takeRestScale(target: PuaTarget): XY {
  const active = find(target, 'scale');
  const saved = restScales.get(target);
  restScales.delete(target);

  if (active?.base) return { x: active.base.x, y: active.base.y };
  if (saved) return saved;
  if (target.scale.x === 0 && target.scale.y === 0) return { x: 1, y: 1 };
  return { x: target.scale.x, y: target.scale.y };
}

export function keepRestScale(target: PuaTarget, scale: XY): void {
  restScales.set(target, scale);
}

export function forgetRestScale(target: PuaTarget): void {
  restScales.delete(target);
}

export function takeRestPosition(target: PuaTarget): XY {
  const active = find(target, 'position');
  const saved = restPositions.get(target);
  restPositions.delete(target);

  if (active?.base) return { x: active.base.x, y: active.base.y };
  if (saved) return saved;
  return { x: target.x, y: target.y };
}

export function keepRestPosition(target: PuaTarget, position: XY): void {
  restPositions.set(target, position);
}

export function forgetRestPosition(target: PuaTarget): void {
  restPositions.delete(target);
}

export function takeRestRotation(target: PuaTarget): number {
  const active = find(target, 'rotation');
  return active?.base?.rotation ?? target.rotation;
}

export function takeRestAlpha(target: PuaTarget, fallback = 1): number {
  const active = find(target, 'alpha');
  const saved = restAlphas.get(target);
  restAlphas.delete(target);

  const alpha = active?.base ? active.base.alpha : saved !== undefined ? saved : target.alpha;
  return alpha === 0 ? fallback : alpha;
}

export function keepRestAlpha(target: PuaTarget, alpha: number): void {
  restAlphas.set(target, alpha);
}

export function forgetRestAlpha(target: PuaTarget): void {
  restAlphas.delete(target);
}
