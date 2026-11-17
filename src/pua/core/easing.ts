import type { EasingFn, EasingName, PuaEasing } from '../types.js';

const BACK = 1.70158;
const BOUNCE = 7.5625;

export const easings: Record<EasingName, EasingFn> = {
  linear: (t) => t,
  quadIn: (t) => t * t,
  quadOut: (t) => t * (2 - t),
  quadInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
  cubicIn: (t) => t * t * t,
  cubicOut: (t) => 1 - Math.pow(1 - t, 3),
  cubicInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - 4 * Math.pow(1 - t, 3)),
  sineInOut: (t) => 0.5 * (1 - Math.cos(Math.PI * t)),
  backIn: (t) => t * t * ((BACK + 1) * t - BACK),
  backOut: (t) => 1 + (t - 1) * (t - 1) * ((BACK + 1) * (t - 1) + BACK),
  backInOut: (t) => {
    const s = BACK * 1.525;
    const u = t * 2;
    if (u < 1) return 0.5 * u * u * ((s + 1) * u - s);
    return 0.5 * ((u - 2) * (u - 2) * ((s + 1) * (u - 2) + s) + 2);
  },
  elasticOut: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1),
  bounceOut: (t) => {
    if (t < 1 / 2.75) return BOUNCE * t * t;
    if (t < 2 / 2.75) return BOUNCE * Math.pow(t - 1.5 / 2.75, 2) + 0.75;
    if (t < 2.5 / 2.75) return BOUNCE * Math.pow(t - 2.25 / 2.75, 2) + 0.9375;
    return BOUNCE * Math.pow(t - 2.625 / 2.75, 2) + 0.984375;
  }
};

export const easingNames = Object.keys(easings) as EasingName[];

export function resolveEasing(easing: PuaEasing | undefined, fallback: EasingName): EasingFn {
  if (typeof easing === 'function') return easing;
  return easings[easing ?? fallback];
}

// Time curve for animations that draw their own motion: bends how fast they play, clamped to the 0..1 range.
export function timeWarp(easing: PuaEasing | undefined): EasingFn | undefined {
  return easing === undefined ? undefined : resolveEasing(easing, 'linear');
}

// Back-out easing whose overshoot peak equals `amount` (0.15 => peaks at 1.15).
// Peak of back-out with strength s is 4s^3 / (27 (s+1)^2); solved by bisection.
export function overshootOut(amount: number): EasingFn {
  let lo = 0;
  let hi = 10;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const peak = (4 * Math.pow(mid, 3)) / (27 * Math.pow(mid + 1, 2));
    if (peak < amount) lo = mid;
    else hi = mid;
  }
  const s = (lo + hi) / 2;
  return (t) => {
    const u = t - 1;
    return u * u * ((s + 1) * u + s) + 1;
  };
}
