import { easings, resolveEasing, timeWarp } from '../core/easing.js';
import { find, run } from '../core/engine.js';
import { createFilter, detachFilter, rgb, runFilter } from '../core/filters.js';
import { blurFilter, setBlur } from '../core/compat.js';
import type { ShaderFilter } from '../core/compat.js';
import { DEG_TO_RAD, visualSize } from '../core/geometry.js';
import { resolveEnd } from '../core/options.js';
import { keepRestAlpha, takeRestAlpha } from '../core/rest.js';
import {
  BLINDS,
  BRIGHTNESS,
  BULGE,
  CHROMATIC,
  CLOCK_WIPE,
  COOLDOWN,
  DISSOLVE,
  FLASH,
  GLITCH,
  GLITTER,
  GLOW,
  GRAYSCALE,
  HOLOGRAM,
  HUE,
  INVERT,
  IRIS,
  MELT,
  OUTLINE,
  PIXELATE,
  RING,
  RIPPLE,
  SCANLINES,
  SEPIA,
  SHIMMER,
  SHINE,
  SHOCKWAVE,
  SLICES,
  STATIC_NOISE,
  TILES,
  TINT,
  TWIST,
  WAVE,
  WIPE,
  ZOOM_BLUR
} from '../core/shaders.js';
import type { EasingFn, PuaCallback, PuaEnd, PuaOptions, PuaTarget, SlideDirection } from '../types.js';

export interface ShineOptions extends PuaOptions {
  duration?: number;
  interval?: number;
  width?: number;
  angle?: number;
  color?: number;
  strength?: number;
}

export interface GlowPulseOptions {
  duration?: number;
  color?: number;
  radius?: number;
  strength?: number;
  delay?: number;
}

export interface HitFlashOptions extends PuaOptions {
  duration?: number;
  color?: number;
  flashes?: number;
}

export interface GlitchOptions extends PuaOptions {
  duration?: number;
  strength?: number;
  slices?: number;
  speed?: number;
  split?: number;
  shift?: number;
}

export interface ShockwaveOptions extends PuaOptions {
  duration?: number;
  amplitude?: number;
  width?: number;
}

export interface WaveOptions {
  duration?: number;
  amplitude?: number;
  frequency?: number;
  delay?: number;
}

export interface HueCycleOptions {
  duration?: number;
  delay?: number;
}

export interface DissolveOptions extends PuaOptions {
  scale?: number;
  edge?: number;
  edgeColor?: number;
}

export interface PixelateOptions extends PuaOptions {
  size?: number;
}

export interface BlurOptions extends PuaOptions {
  strength?: number;
}

export function shine(target: PuaTarget, end?: PuaEnd<ShineOptions>): void {
  const o = resolveEnd(end);
  const duration = o.duration ?? 900;
  const total = o.interval ?? duration;
  const active = Math.min(1, duration / total);
  const width = o.width ?? 0.25;
  const angle = (o.angle ?? 25) * DEG_TO_RAD;
  const span = Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle));
  const start = -span / 2 - width;
  const travel = span + 2 * width;
  const easing = resolveEasing(o.easing, 'linear');
  const loop = o.interval !== undefined;

  const filter = createFilter(SHINE, {
    uProgress: start,
    uWidth: width,
    uAngle: angle,
    uStrength: o.strength ?? 0.8,
    uColor: rgb(o.color ?? 0xffffff)
  });

  runFilter({
    target,
    filter,
    duration: total,
    delay: o.delay,
    loop,
    onUpdate: (p) => {
      const u = p / active;
      filter.uniforms.uProgress = u >= 1 ? start : start + easing(u) * travel;
    },
    onComplete: loop ? undefined : finish(target, filter, o.onComplete)
  });
}

export function glowPulse(target: PuaTarget, options: GlowPulseOptions = {}): void {
  const radius = options.radius ?? 12;
  const strength = options.strength ?? 1;
  const filter = createFilter(
    GLOW,
    { uRadius: radius, uStrength: 0, uColor: rgb(options.color ?? 0x7c5cff) },
    Math.ceil(radius) + 2
  );

  runFilter({
    target,
    filter,
    duration: options.duration ?? 1200,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uStrength = strength * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
    }
  });
}

export function hitFlash(target: PuaTarget, end?: PuaEnd<HitFlashOptions>): void {
  const o = resolveEnd(end);
  const flashes = o.flashes ?? 1;
  const filter = createFilter(FLASH, { uAmount: 0, uColor: rgb(o.color ?? 0xffffff) });

  runFilter({
    target,
    filter,
    duration: o.duration ?? 220,
    delay: o.delay,
    timing: timeWarp(o.easing),
    onUpdate: (p) => {
      filter.uniforms.uAmount = Math.abs(Math.sin(p * Math.PI * flashes));
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function glitch(target: PuaTarget, end?: PuaEnd<GlitchOptions>): void {
  const o = resolveEnd(end);
  const strength = o.strength ?? 1;
  const duration = o.duration ?? 500;
  const split = o.split ?? 4;
  const shift = o.shift ?? 0.25;
  const step = 1000 / Math.max(1, o.speed ?? 20);
  const padding = Math.ceil((visualSize(target).width * shift * 0.24 + split) * strength) + 2;
  const filter = createFilter(
    GLITCH,
    { uStrength: 0, uSeed: 0, uSlices: o.slices ?? 12, uSplit: split, uShift: shift },
    padding
  );

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    timing: timeWarp(o.easing),
    onUpdate: (p) => {
      filter.uniforms.uStrength = strength * Math.sin(p * Math.PI);
      filter.uniforms.uSeed = Math.floor((p * duration) / step);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function shockwave(target: PuaTarget, end?: PuaEnd<ShockwaveOptions>): void {
  const o = resolveEnd(end);
  const amplitude = o.amplitude ?? 20;
  const easing = resolveEasing(o.easing, 'quadOut');
  const filter = createFilter(
    SHOCKWAVE,
    { uProgress: 0, uAmplitude: amplitude, uWidth: o.width ?? 0.25 },
    Math.ceil(amplitude) + 2
  );

  runFilter({
    target,
    filter,
    duration: o.duration ?? 700,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easing(p);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function wave(target: PuaTarget, options: WaveOptions = {}): void {
  const amplitude = options.amplitude ?? 6;
  const filter = createFilter(
    WAVE,
    { uTime: 0, uAmplitude: amplitude, uFrequency: options.frequency ?? 2 },
    Math.ceil(amplitude) + 1
  );

  runFilter({
    target,
    filter,
    duration: options.duration ?? 1500,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uTime = p * Math.PI * 2;
    }
  });
}

export function hueCycle(target: PuaTarget, options: HueCycleOptions = {}): void {
  const filter = createFilter(HUE, { uHue: 0 });

  runFilter({
    target,
    filter,
    duration: options.duration ?? 2000,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uHue = p * Math.PI * 2;
    }
  });
}

export function dissolveIn(target: PuaTarget, duration: number, end?: PuaEnd<DissolveOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadOut');
  const filter = dissolveFilter(o, 1);
  target.visible = true;

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = 1 - easing(p);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function dissolveOut(target: PuaTarget, duration: number, end?: PuaEnd<DissolveOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadIn');
  const filter = dissolveFilter(o, 0);

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easing(p);
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}

export function pixelateIn(target: PuaTarget, duration: number, end?: PuaEnd<PixelateOptions>): void {
  const o = resolveEnd(end);
  const size = Math.max(1, o.size ?? 24);
  const easing = resolveEasing(o.easing, 'quadOut');
  const filter = createFilter(PIXELATE, { uSize: size });
  const alpha = appear(target);

  fade(target, alpha, duration, o.delay, easings.quadOut);
  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uSize = 1 + (size - 1) * (1 - easing(p));
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function pixelateOut(target: PuaTarget, duration: number, end?: PuaEnd<PixelateOptions>): void {
  const o = resolveEnd(end);
  const size = Math.max(1, o.size ?? 24);
  const easing = resolveEasing(o.easing, 'quadIn');
  const filter = createFilter(PIXELATE, { uSize: 1 });
  const alpha = takeRestAlpha(target);

  fade(target, 0, duration, o.delay, easings.quadIn, alpha, () => keepRestAlpha(target, alpha));
  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uSize = 1 + (size - 1) * easing(p);
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}

export function blurIn(target: PuaTarget, duration: number, end?: PuaEnd<BlurOptions>): void {
  const o = resolveEnd(end);
  const strength = o.strength ?? 12;
  const easing = resolveEasing(o.easing, 'quadOut');
  const filter = blurFilter(strength);
  const alpha = appear(target);

  fade(target, alpha, duration, o.delay, easings.quadOut);
  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      setBlur(filter, strength * (1 - easing(p)));
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function blurOut(target: PuaTarget, duration: number, end?: PuaEnd<BlurOptions>): void {
  const o = resolveEnd(end);
  const strength = o.strength ?? 12;
  const easing = resolveEasing(o.easing, 'quadIn');
  const filter = blurFilter(0);
  const alpha = takeRestAlpha(target);

  fade(target, 0, duration, o.delay, easings.quadIn, alpha, () => keepRestAlpha(target, alpha));
  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      setBlur(filter, strength * easing(p));
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}

function dissolveFilter(o: DissolveOptions, progress: number) {
  return createFilter(DISSOLVE, {
    uProgress: progress,
    uScale: o.scale ?? 8,
    uEdge: o.edge ?? 0.08,
    uEdgeColor: rgb(o.edgeColor ?? 0x7c5cff)
  });
}

function appear(target: PuaTarget): number {
  const alpha = takeRestAlpha(target);
  if (!find(target, 'alpha')) target.alpha = 0;
  target.visible = true;
  return alpha;
}

function fade(
  target: PuaTarget,
  to: number,
  duration: number,
  delay: number | undefined,
  easing: EasingFn,
  base = to,
  onComplete?: PuaCallback
): void {
  run({
    target,
    channel: 'alpha',
    object: target,
    to: { alpha: to },
    duration,
    easing,
    delay,
    base: { alpha: base },
    onComplete
  });
}

function finish(target: PuaTarget, filter: Parameters<typeof detachFilter>[1], onComplete?: PuaCallback): PuaCallback {
  return () => {
    detachFilter(target, filter);
    onComplete?.();
  };
}

function finishHidden(target: PuaTarget, filter: Parameters<typeof detachFilter>[1], onComplete?: PuaCallback): PuaCallback {
  return () => {
    target.visible = false;
    detachFilter(target, filter);
    onComplete?.();
  };
}

export interface OutlinePulseOptions {
  duration?: number;
  color?: number;
  thickness?: number;
  strength?: number;
  delay?: number;
}

export interface ScanlinesOptions {
  duration?: number;
  count?: number;
  strength?: number;
  delay?: number;
}

export interface RippleOptions {
  duration?: number;
  amplitude?: number;
  frequency?: number;
  delay?: number;
}

export interface WipeOptions extends PuaOptions {
  edge?: number;
}

export interface IrisOptions extends PuaOptions {
  edge?: number;
}

export interface ChromaticOptions {
  duration?: number;
  strength?: number;
  delay?: number;
}

export interface TwistOptions extends PuaOptions {
  duration?: number;
  angle?: number;
  radius?: number;
}

export interface ShimmerOptions {
  duration?: number;
  amplitude?: number;
  scale?: number;
  delay?: number;
}

export interface BulgeOptions extends PuaOptions {
  duration?: number;
  strength?: number;
  radius?: number;
}

export interface InvertFlashOptions extends PuaOptions {
  duration?: number;
  flashes?: number;
}

export interface TintOptions extends PuaOptions {
  amount?: number;
}

export interface ZoomBlurOptions extends PuaOptions {
  duration?: number;
  strength?: number;
}

export interface BlindsOptions extends PuaOptions {
  count?: number;
  edge?: number;
}

export interface GlitterOptions {
  duration?: number;
  color?: number;
  density?: number;
  strength?: number;
  delay?: number;
}

const WIPE_DIRECTIONS: Record<SlideDirection, number[]> = {
  left: [1, 0],
  right: [-1, 0],
  top: [0, 1],
  bottom: [0, -1]
};

const grayFilters = new WeakMap<PuaTarget, ShaderFilter>();
const tintFilters = new WeakMap<PuaTarget, ShaderFilter>();

export function outlinePulse(target: PuaTarget, options: OutlinePulseOptions = {}): void {
  const thickness = options.thickness ?? 3;
  const strength = options.strength ?? 1;
  const filter = createFilter(
    OUTLINE,
    { uThickness: thickness, uStrength: 0, uColor: rgb(options.color ?? 0x7c5cff) },
    Math.ceil(thickness) + 2
  );

  runFilter({
    target,
    filter,
    duration: options.duration ?? 1200,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uStrength = strength * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
    }
  });
}

export function grayscale(target: PuaTarget, amount: number, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadOut');
  const from = currentAmount(target, grayFilters);
  const filter = createFilter(GRAYSCALE, { uAmount: from });
  grayFilters.set(target, filter);

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uAmount = from + (amount - from) * easing(p);
    },
    onComplete: amount > 0 ? o.onComplete : finish(target, filter, o.onComplete)
  });
}

export function scanlines(target: PuaTarget, options: ScanlinesOptions = {}): void {
  const filter = createFilter(SCANLINES, { uTime: 0, uCount: options.count ?? 24, uStrength: options.strength ?? 0.35 });

  runFilter({
    target,
    filter,
    duration: options.duration ?? 2000,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uTime = p;
    }
  });
}

export function ripple(target: PuaTarget, options: RippleOptions = {}): void {
  const amplitude = options.amplitude ?? 4;
  const filter = createFilter(
    RIPPLE,
    { uTime: 0, uAmplitude: amplitude, uFrequency: options.frequency ?? 3 },
    Math.ceil(amplitude) + 1
  );

  runFilter({
    target,
    filter,
    duration: options.duration ?? 1800,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uTime = p;
    }
  });
}

export function wipeIn(target: PuaTarget, direction: SlideDirection, duration: number, end?: PuaEnd<WipeOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadOut');
  const filter = createFilter(WIPE, { uProgress: 0, uDirection: WIPE_DIRECTIONS[direction], uEdge: o.edge ?? 0.1 });
  target.visible = true;

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easing(p);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function wipeOut(target: PuaTarget, direction: SlideDirection, duration: number, end?: PuaEnd<WipeOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadIn');
  const filter = createFilter(WIPE, { uProgress: 1, uDirection: WIPE_DIRECTIONS[direction], uEdge: o.edge ?? 0.1 });

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = 1 - easing(p);
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}

export function irisIn(target: PuaTarget, duration: number, end?: PuaEnd<IrisOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadOut');
  const filter = createFilter(IRIS, { uProgress: 0, uEdge: o.edge ?? 0.15 });
  target.visible = true;

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easing(p);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function irisOut(target: PuaTarget, duration: number, end?: PuaEnd<IrisOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadIn');
  const filter = createFilter(IRIS, { uProgress: 1, uEdge: o.edge ?? 0.15 });

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = 1 - easing(p);
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}

export function chromatic(target: PuaTarget, options: ChromaticOptions = {}): void {
  const strength = options.strength ?? 4;
  const filter = createFilter(CHROMATIC, { uAmount: 0 }, Math.ceil(strength) + 1);

  runFilter({
    target,
    filter,
    duration: options.duration ?? 1400,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uAmount = strength * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
    }
  });
}

export function twist(target: PuaTarget, end?: PuaEnd<TwistOptions>): void {
  const o = resolveEnd(end);
  const angle = (o.angle ?? 180) * DEG_TO_RAD;
  const filter = createFilter(TWIST, { uAngle: 0, uRadius: o.radius ?? 1 });

  runFilter({
    target,
    filter,
    duration: o.duration ?? 600,
    delay: o.delay,
    timing: timeWarp(o.easing),
    onUpdate: (p) => {
      filter.uniforms.uAngle = angle * Math.sin(p * Math.PI);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function shimmer(target: PuaTarget, options: ShimmerOptions = {}): void {
  const amplitude = options.amplitude ?? 4;
  const filter = createFilter(
    SHIMMER,
    { uTime: 0, uAmplitude: amplitude, uScale: options.scale ?? 6 },
    Math.ceil(amplitude) + 1
  );

  runFilter({
    target,
    filter,
    duration: options.duration ?? 3000,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uTime = Math.sin(p * Math.PI * 2) * 2;
    }
  });
}

export function bulge(target: PuaTarget, end?: PuaEnd<BulgeOptions>): void {
  const o = resolveEnd(end);
  const strength = o.strength ?? 0.6;
  const padding = Math.ceil(visualSize(target).height * 0.25 * Math.max(0, strength));
  const filter = createFilter(BULGE, { uStrength: 0, uRadius: o.radius ?? 1 }, padding);

  runFilter({
    target,
    filter,
    duration: o.duration ?? 450,
    delay: o.delay,
    timing: timeWarp(o.easing),
    onUpdate: (p) => {
      filter.uniforms.uStrength = strength * Math.sin(p * Math.PI);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function invertFlash(target: PuaTarget, end?: PuaEnd<InvertFlashOptions>): void {
  const o = resolveEnd(end);
  const flashes = o.flashes ?? 1;
  const filter = createFilter(INVERT, { uAmount: 0 });

  runFilter({
    target,
    filter,
    duration: o.duration ?? 250,
    delay: o.delay,
    timing: timeWarp(o.easing),
    onUpdate: (p) => {
      filter.uniforms.uAmount = Math.abs(Math.sin(p * Math.PI * flashes));
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function tintTo(target: PuaTarget, color: number, duration: number, end?: PuaEnd<TintOptions>): void {
  const o = resolveEnd(end);
  const amount = o.amount ?? 1;
  const easing = resolveEasing(o.easing, 'quadOut');
  const from = currentAmount(target, tintFilters);
  const filter = createFilter(TINT, { uAmount: from, uColor: rgb(color) });
  tintFilters.set(target, filter);

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uAmount = from + (amount - from) * easing(p);
    },
    onComplete: amount > 0 ? o.onComplete : finish(target, filter, o.onComplete)
  });
}

export function zoomBlur(target: PuaTarget, end?: PuaEnd<ZoomBlurOptions>): void {
  const o = resolveEnd(end);
  const strength = o.strength ?? 0.3;
  const size = visualSize(target);
  const filter = createFilter(ZOOM_BLUR, { uStrength: 0 }, Math.ceil(Math.max(size.width, size.height) * strength * 0.5));

  runFilter({
    target,
    filter,
    duration: o.duration ?? 400,
    delay: o.delay,
    timing: timeWarp(o.easing),
    onUpdate: (p) => {
      filter.uniforms.uStrength = strength * Math.sin(p * Math.PI);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function blindsIn(target: PuaTarget, duration: number, end?: PuaEnd<BlindsOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadOut');
  const filter = createFilter(BLINDS, { uProgress: 0, uCount: o.count ?? 6, uEdge: o.edge ?? 0.08 });
  target.visible = true;

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easing(p);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function blindsOut(target: PuaTarget, duration: number, end?: PuaEnd<BlindsOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadIn');
  const filter = createFilter(BLINDS, { uProgress: 1, uCount: o.count ?? 6, uEdge: o.edge ?? 0.08 });

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = 1 - easing(p);
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}

export function glitter(target: PuaTarget, options: GlitterOptions = {}): void {
  const filter = createFilter(GLITTER, {
    uTime: 0,
    uDensity: options.density ?? 10,
    uStrength: options.strength ?? 1,
    uColor: rgb(options.color ?? 0xffffff)
  });

  runFilter({
    target,
    filter,
    duration: options.duration ?? 2000,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uTime = p;
    }
  });
}

// Amount of the previous persistent filter (grayscale / tint) if it is still attached, so a new call tweens from it.
function currentAmount(target: PuaTarget, store: WeakMap<PuaTarget, ShaderFilter>): number {
  const previous = store.get(target);
  if (!previous || !target.filters?.includes(previous)) return 0;
  return Number(previous.uniforms.uAmount) || 0;
}

export interface ColorPulseOptions {
  duration?: number;
  strength?: number;
  delay?: number;
}

export interface StaticNoiseOptions {
  strength?: number;
  size?: number;
  delay?: number;
  interval?: number;
}

export interface HologramOptions {
  duration?: number;
  strength?: number;
  scale?: number;
  delay?: number;
  angle?: number;
}

export interface CooldownOptions extends PuaOptions {
  dim?: number;
  clockwise?: boolean;
}

export interface RingPulseOptions {
  duration?: number;
  color?: number;
  width?: number;
  strength?: number;
  delay?: number;
}

export interface BlurPulseOptions {
  duration?: number;
  strength?: number;
  delay?: number;
}

export interface GlitchLoopOptions {
  interval?: number;
  duration?: number;
  strength?: number;
  slices?: number;
  delay?: number;
  speed?: number;
  split?: number;
  shift?: number;
}

export interface MeltOptions extends PuaOptions {
  columns?: number;
}

export interface ClockWipeOptions extends PuaOptions {
  edge?: number;
  clockwise?: boolean;
}

export interface TilesOptions extends PuaOptions {
  count?: number;
  spread?: number;
}

export interface SlicesOptions extends PuaOptions {
  count?: number;
}

export interface VortexOptions extends PuaOptions {
  angle?: number;
  radius?: number;
}

const sepiaFilters = new WeakMap<PuaTarget, ShaderFilter>();
const brightFilters = new WeakMap<PuaTarget, ShaderFilter>();

export function sepia(target: PuaTarget, amount: number, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadOut');
  const from = currentAmount(target, sepiaFilters);
  const filter = createFilter(SEPIA, { uAmount: from });
  sepiaFilters.set(target, filter);

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uAmount = from + (amount - from) * easing(p);
    },
    onComplete: amount > 0 ? o.onComplete : finish(target, filter, o.onComplete)
  });
}

export function brightness(target: PuaTarget, amount: number, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadOut');
  const from = currentAmount(target, brightFilters);
  const filter = createFilter(BRIGHTNESS, { uAmount: from });
  brightFilters.set(target, filter);

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uAmount = from + (amount - from) * easing(p);
    },
    onComplete: amount !== 0 ? o.onComplete : finish(target, filter, o.onComplete)
  });
}

export function colorPulse(target: PuaTarget, color: number, options: ColorPulseOptions = {}): void {
  const strength = options.strength ?? 0.6;
  const filter = createFilter(FLASH, { uAmount: 0, uColor: rgb(color) });

  runFilter({
    target,
    filter,
    duration: options.duration ?? 1000,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uAmount = strength * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
    }
  });
}

export function staticNoise(target: PuaTarget, options: StaticNoiseOptions = {}): void {
  const interval = options.interval ?? 0;
  let last = 2;
  const filter = createFilter(STATIC_NOISE, {
    uSeed: 0,
    uStrength: options.strength ?? 0.35,
    uSize: Math.max(1, options.size ?? 2)
  });

  runFilter({
    target,
    filter,
    duration: interval > 0 ? interval : 1000,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      const cycled = p < last;
      last = p;
      if (interval > 0 && !cycled) return;
      filter.uniforms.uSeed = Math.random();
    }
  });
}

export function hologram(target: PuaTarget, options: HologramOptions = {}): void {
  const angle = (options.angle ?? 45) * DEG_TO_RAD;
  const filter = createFilter(HOLOGRAM, {
    uTime: 0,
    uStrength: options.strength ?? 0.6,
    uScale: options.scale ?? 1.5,
    uDirection: [Math.cos(angle) * Math.SQRT2, Math.sin(angle) * Math.SQRT2]
  });

  runFilter({
    target,
    filter,
    duration: options.duration ?? 2400,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uTime = p;
    }
  });
}

export function cooldown(target: PuaTarget, duration: number, end?: PuaEnd<CooldownOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'linear');
  const filter = createFilter(COOLDOWN, { uProgress: 0, uDim: o.dim ?? 0.6, uSide: o.clockwise === false ? -1 : 1 });

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easing(p);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function ringPulse(target: PuaTarget, options: RingPulseOptions = {}): void {
  const filter = createFilter(RING, {
    uProgress: 0,
    uWidth: options.width ?? 0.18,
    uStrength: options.strength ?? 0.9,
    uColor: rgb(options.color ?? 0xffffff)
  });

  runFilter({
    target,
    filter,
    duration: options.duration ?? 1200,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easings.quadOut(p);
    }
  });
}

export function blurPulse(target: PuaTarget, options: BlurPulseOptions = {}): void {
  const strength = options.strength ?? 6;
  const filter = blurFilter(0);

  runFilter({
    target,
    filter,
    duration: options.duration ?? 1600,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      setBlur(filter, strength * (0.5 - 0.5 * Math.cos(p * Math.PI * 2)));
    }
  });
}

export function glitchLoop(target: PuaTarget, options: GlitchLoopOptions = {}): void {
  const strength = options.strength ?? 1;
  const interval = options.interval ?? 2200;
  const burst = options.duration ?? 400;
  const active = Math.min(1, burst / interval);
  const split = options.split ?? 4;
  const shift = options.shift ?? 0.25;
  const step = 1000 / Math.max(1, options.speed ?? 20);
  const padding = Math.ceil((visualSize(target).width * shift * 0.24 + split) * strength) + 2;
  const filter = createFilter(
    GLITCH,
    { uStrength: 0, uSeed: 0, uSlices: options.slices ?? 12, uSplit: split, uShift: shift },
    padding
  );

  runFilter({
    target,
    filter,
    duration: interval,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      const u = p / active;
      filter.uniforms.uStrength = u >= 1 ? 0 : strength * Math.sin(u * Math.PI);
      filter.uniforms.uSeed = Math.floor((p * interval) / step);
    }
  });
}

export function meltIn(target: PuaTarget, duration: number, end?: PuaEnd<MeltOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadOut');
  const filter = createFilter(MELT, { uProgress: 1, uColumns: o.columns ?? 24 });
  target.visible = true;

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = 1 - easing(p);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function meltOut(target: PuaTarget, duration: number, end?: PuaEnd<MeltOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'linear');
  const filter = createFilter(MELT, { uProgress: 0, uColumns: o.columns ?? 24 });

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easing(p);
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}

export function clockWipeIn(target: PuaTarget, duration: number, end?: PuaEnd<ClockWipeOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadInOut');
  const filter = createFilter(CLOCK_WIPE, {
    uProgress: 0,
    uEdge: Math.max(0.001, o.edge ?? 0.03),
    uSide: o.clockwise === false ? -1 : 1
  });
  target.visible = true;

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easing(p);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function clockWipeOut(target: PuaTarget, duration: number, end?: PuaEnd<ClockWipeOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadInOut');
  const filter = createFilter(CLOCK_WIPE, {
    uProgress: 1,
    uEdge: Math.max(0.001, o.edge ?? 0.03),
    uSide: o.clockwise === false ? -1 : 1
  });

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = 1 - easing(p);
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}

export function tilesIn(target: PuaTarget, duration: number, end?: PuaEnd<TilesOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadOut');
  const filter = createFilter(TILES, { uProgress: 0, uCount: o.count ?? 5, uEdge: Math.max(0.01, o.spread ?? 0.5) });
  target.visible = true;

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easing(p);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function tilesOut(target: PuaTarget, duration: number, end?: PuaEnd<TilesOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadIn');
  const filter = createFilter(TILES, { uProgress: 1, uCount: o.count ?? 5, uEdge: Math.max(0.01, o.spread ?? 0.5) });

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = 1 - easing(p);
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}

export function slicesIn(target: PuaTarget, duration: number, end?: PuaEnd<SlicesOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'cubicOut');
  const filter = createFilter(SLICES, { uProgress: 0, uCount: o.count ?? 6 });
  target.visible = true;

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = easing(p);
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function slicesOut(target: PuaTarget, duration: number, end?: PuaEnd<SlicesOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'cubicIn');
  const filter = createFilter(SLICES, { uProgress: 1, uCount: o.count ?? 6 });

  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uProgress = 1 - easing(p);
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}

export function vortexIn(target: PuaTarget, duration: number, end?: PuaEnd<VortexOptions>): void {
  const o = resolveEnd(end);
  const angle = (o.angle ?? 360) * DEG_TO_RAD;
  const easing = resolveEasing(o.easing, 'cubicOut');
  const filter = createFilter(TWIST, { uAngle: angle, uRadius: o.radius ?? 1 });
  const alpha = appear(target);

  fade(target, alpha, duration, o.delay, easings.quadOut);
  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uAngle = angle * (1 - easing(p));
    },
    onComplete: finish(target, filter, o.onComplete)
  });
}

export function vortexOut(target: PuaTarget, duration: number, end?: PuaEnd<VortexOptions>): void {
  const o = resolveEnd(end);
  const angle = (o.angle ?? 360) * DEG_TO_RAD;
  const easing = resolveEasing(o.easing, 'cubicIn');
  const filter = createFilter(TWIST, { uAngle: 0, uRadius: o.radius ?? 1 });
  const alpha = takeRestAlpha(target);

  fade(target, 0, duration, o.delay, easings.quadIn, alpha, () => keepRestAlpha(target, alpha));
  runFilter({
    target,
    filter,
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      filter.uniforms.uAngle = angle * easing(p);
    },
    onComplete: finishHidden(target, filter, o.onComplete)
  });
}
