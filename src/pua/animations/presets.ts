import { easings, overshootOut, resolveEasing, timeWarp } from '../core/easing.js';
import { find, run } from '../core/engine.js';
import { DEG_TO_RAD, DIRECTIONS, visualSize } from '../core/geometry.js';
import { resolveEnd } from '../core/options.js';
import {
  keepRestAlpha,
  keepRestPosition,
  keepRestScale,
  takeRestAlpha,
  takeRestPosition,
  takeRestRotation,
  takeRestScale
} from '../core/rest.js';
import type { EasingFn, PuaCallback, PuaEnd, PuaOptions, PuaTarget, SlideDirection } from '../types.js';

export interface PopOptions extends PuaOptions {
  duration?: number;
  overshoot?: number;
}

export interface BounceOptions extends PuaOptions {
  duration?: number;
  height?: number;
}

export interface PulseOptions {
  duration?: number;
  strength?: number;
  delay?: number;
}

export interface ShakeOptions extends PuaOptions {
  duration?: number;
  amplitude?: number;
  shakes?: number;
}

export interface JellyOptions extends PuaOptions {
  duration?: number;
  strength?: number;
  wobbles?: number;
}

export interface WobbleOptions extends PuaOptions {
  duration?: number;
  angle?: number;
  wobbles?: number;
}

export interface FlipOptions extends PuaOptions {
  duration?: number;
  axis?: 'x' | 'y';
}

export interface TadaOptions extends PuaOptions {
  duration?: number;
  strength?: number;
  angle?: number;
  wiggles?: number;
}

export interface SpinOptions extends PuaOptions {
  duration?: number;
  turns?: number;
}

export interface FlashOptions extends PuaOptions {
  duration?: number;
  flashes?: number;
}

export interface DropInOptions extends PuaOptions {
  duration?: number;
  height?: number;
}

export interface NudgeOptions extends PuaOptions {
  duration?: number;
  distance?: number;
}

export interface HeartbeatOptions {
  duration?: number;
  strength?: number;
  delay?: number;
}

export interface FloatOptions {
  duration?: number;
  height?: number;
  delay?: number;
}

export function pop(target: PuaTarget, end?: PuaEnd<PopOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  target.visible = true;
  target.scale.set(0);

  run({
    target,
    channel: 'scale',
    object: target.scale,
    to: rest,
    duration: o.duration ?? 420,
    easing: o.easing ? resolveEasing(o.easing, 'backOut') : overshootOut(o.overshoot ?? 0.15),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function bounce(target: PuaTarget, end?: PuaEnd<BounceOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const height = o.height ?? Math.max(16, visualSize(target).height * 0.35);

  run({
    target,
    channel: 'position',
    duration: o.duration ?? 650,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const lift = p < 0.3 ? easings.quadOut(p / 0.3) : 1 - easings.bounceOut((p - 0.3) / 0.7);
      target.position.set(rest.x, rest.y - height * lift);
    },
    onComplete: o.onComplete
  });
}

export function pulse(target: PuaTarget, options: PulseOptions = {}): void {
  const rest = takeRestScale(target);
  const strength = options.strength ?? 0.1;

  run({
    target,
    channel: 'scale',
    duration: options.duration ?? 900,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const wave = Math.sin(p * Math.PI);
      const s = 1 + strength * wave * wave;
      target.scale.set(rest.x * s, rest.y * s);
    }
  });
}

export function shake(target: PuaTarget, end?: PuaEnd<ShakeOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const amplitude = o.amplitude ?? Math.min(20, Math.max(6, visualSize(target).width * 0.06));
  const shakes = o.shakes ?? 6;

  run({
    target,
    channel: 'position',
    duration: o.duration ?? 450,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const offset = Math.sin(p * Math.PI * shakes) * (1 - p) * amplitude;
      target.position.set(rest.x + offset, rest.y);
    },
    onComplete: o.onComplete
  });
}

export function jelly(target: PuaTarget, end?: PuaEnd<JellyOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const strength = o.strength ?? 0.25;
  const wobbles = o.wobbles ?? 5;

  run({
    target,
    channel: 'scale',
    duration: o.duration ?? 650,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const w = Math.sin(p * Math.PI * wobbles) * (1 - p) * strength;
      target.scale.set(rest.x * (1 + w), rest.y * (1 - w));
    },
    onComplete: o.onComplete
  });
}

export function wobble(target: PuaTarget, end?: PuaEnd<WobbleOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestRotation(target);
  const angle = (o.angle ?? 10) * DEG_TO_RAD;
  const wobbles = o.wobbles ?? 4;

  run({
    target,
    channel: 'rotation',
    duration: o.duration ?? 700,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: { rotation: rest },
    onUpdate: (p) => {
      target.rotation = rest + Math.sin(p * Math.PI * wobbles) * (1 - p) * angle;
    },
    onComplete: o.onComplete
  });
}

export function flip(target: PuaTarget, end?: PuaEnd<FlipOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const axis = o.axis ?? 'x';

  run({
    target,
    channel: 'scale',
    duration: o.duration ?? 500,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const s = Math.abs(Math.cos(p * Math.PI));
      if (axis === 'x') target.scale.set(rest.x * s, rest.y);
      else target.scale.set(rest.x, rest.y * s);
    },
    onComplete: o.onComplete
  });
}

export function tada(target: PuaTarget, end?: PuaEnd<TadaOptions>): void {
  const o = resolveEnd(end);
  const scaleRest = takeRestScale(target);
  const rotationRest = takeRestRotation(target);
  const strength = o.strength ?? 0.1;
  const angle = (o.angle ?? 4) * DEG_TO_RAD;
  const wiggles = o.wiggles ?? 5;
  const duration = o.duration ?? 800;

  run({
    target,
    channel: 'rotation',
    duration,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: { rotation: rotationRest },
    onUpdate: (p) => {
      target.rotation = rotationRest + Math.sin(p * Math.PI * wiggles) * Math.sin(p * Math.PI) * angle;
    }
  });

  run({
    target,
    channel: 'scale',
    duration,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: scaleRest,
    onUpdate: (p) => {
      const s = 1 + strength * Math.sin(p * Math.PI);
      target.scale.set(scaleRest.x * s, scaleRest.y * s);
    },
    onComplete: o.onComplete
  });
}

export function spin(target: PuaTarget, end?: PuaEnd<SpinOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestRotation(target);
  const total = (o.turns ?? 1) * Math.PI * 2;
  const easing = resolveEasing(o.easing, 'cubicInOut');

  run({
    target,
    channel: 'rotation',
    duration: o.duration ?? 800,
    delay: o.delay,
    base: { rotation: rest },
    onUpdate: (p) => {
      target.rotation = rest + easing(p) * total;
    },
    onComplete: () => {
      target.rotation = rest;
      o.onComplete?.();
    }
  });
}

export function flash(target: PuaTarget, end?: PuaEnd<FlashOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestAlpha(target);
  const flashes = o.flashes ?? 2;
  target.visible = true;

  run({
    target,
    channel: 'alpha',
    duration: o.duration ?? 600,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: { alpha: rest },
    onUpdate: (p) => {
      target.alpha = rest * (0.5 + 0.5 * Math.cos(p * Math.PI * 2 * flashes));
    },
    onComplete: o.onComplete
  });
}

export function dropIn(target: PuaTarget, end?: PuaEnd<DropInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const height = o.height ?? Math.max(40, visualSize(target).height * 1.5);
  target.visible = true;
  target.position.set(rest.x, rest.y - height);

  run({
    target,
    channel: 'position',
    object: target.position,
    to: rest,
    duration: o.duration ?? 600,
    easing: resolveEasing(o.easing, 'bounceOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function nudge(target: PuaTarget, direction: SlideDirection, end?: PuaEnd<NudgeOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const dir = DIRECTIONS[direction];
  const distance = o.distance ?? 12;

  run({
    target,
    channel: 'position',
    duration: o.duration ?? 400,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const k = Math.sin(p * Math.PI);
      target.position.set(rest.x + dir.x * distance * k, rest.y + dir.y * distance * k);
    },
    onComplete: o.onComplete
  });
}

export function heartbeat(target: PuaTarget, options: HeartbeatOptions = {}): void {
  const rest = takeRestScale(target);
  const strength = options.strength ?? 0.12;

  run({
    target,
    channel: 'scale',
    duration: options.duration ?? 1000,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const s = 1 + strength * (beat(p, 0, 0.18) + beat(p, 0.22, 0.42) * 0.8);
      target.scale.set(rest.x * s, rest.y * s);
    }
  });
}

export function float(target: PuaTarget, options: FloatOptions = {}): void {
  const rest = takeRestPosition(target);
  const height = options.height ?? 10;

  run({
    target,
    channel: 'position',
    duration: options.duration ?? 2000,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      target.position.set(rest.x, rest.y - height * 0.5 * (1 - Math.cos(p * Math.PI * 2)));
    }
  });
}

function beat(p: number, start: number, end: number): number {
  if (p < start || p > end) return 0;
  return Math.sin(((p - start) / (end - start)) * Math.PI);
}

export interface RubberBandOptions extends PuaOptions {
  duration?: number;
  strength?: number;
}

export interface StampOptions extends PuaOptions {
  duration?: number;
  from?: number;
}

export interface RollInOptions extends PuaOptions {
  duration?: number;
  distance?: number;
  turns?: number;
  direction?: 'left' | 'right';
}

export interface FlipInOptions extends PuaOptions {
  duration?: number;
  axis?: 'x' | 'y';
}

export interface SwirlOptions extends PuaOptions {
  duration?: number;
  turns?: number;
}

export interface JumpOptions extends PuaOptions {
  duration?: number;
  height?: number;
  squash?: number;
}

export interface ImpactOptions extends PuaOptions {
  duration?: number;
  strength?: number;
}

export interface ElasticInOptions extends PuaOptions {
  duration?: number;
  from?: number;
}

export interface BounceInOptions extends PuaOptions {
  duration?: number;
  from?: number;
}

export interface PopOutOptions extends PuaOptions {
  duration?: number;
  overshoot?: number;
}

export interface LightSpeedInOptions extends PuaOptions {
  duration?: number;
  distance?: number;
  skew?: number;
  direction?: 'left' | 'right';
}

export interface VibrateOptions extends PuaOptions {
  duration?: number;
  angle?: number;
  shakes?: number;
}

export interface FlickerOptions extends PuaOptions {
  duration?: number;
  intensity?: number;
}

export interface BlinkOptions {
  interval?: number;
  delay?: number;
  alpha?: number;
}

export interface BreatheOptions {
  duration?: number;
  strength?: number;
  alpha?: number;
  delay?: number;
}

export interface SwayOptions {
  duration?: number;
  angle?: number;
  delay?: number;
}

export interface JitterOptions {
  amplitude?: number;
  delay?: number;
  interval?: number;
}

const RUBBER_BAND: [number, number][] = [
  [0, 0],
  [0.3, 1],
  [0.4, -1],
  [0.5, 0.6],
  [0.65, -0.2],
  [0.75, 0.2],
  [1, 0]
];
const LIGHT_SPEED_SKEW: [number, number][] = [
  [0, -1],
  [0.6, 0.6],
  [0.8, -0.15],
  [1, 0]
];
const FLICKER = [1, 0.2, 0.9, 0.1, 1, 1, 0.3, 1, 0.1, 0.8, 1, 0.2, 1, 1, 1, 1];

export function rubberBand(target: PuaTarget, end?: PuaEnd<RubberBandOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const strength = o.strength ?? 0.25;

  run({
    target,
    channel: 'scale',
    duration: o.duration ?? 900,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const k = keyframe(RUBBER_BAND, p) * strength;
      target.scale.set(rest.x * (1 + k), rest.y * (1 - k));
    },
    onComplete: o.onComplete
  });
}

export function stamp(target: PuaTarget, end?: PuaEnd<StampOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const alpha = appear(target);
  const from = o.from ?? 2.5;
  const duration = o.duration ?? 450;
  const easing = resolveEasing(o.easing, 'cubicIn');

  fadeTo(target, alpha, duration * 0.7, o.delay, easings.quadIn);
  run({
    target,
    channel: 'scale',
    duration,
    delay: o.delay,
    base: rest,
    onUpdate: (p) => {
      const s = from + (1 - from) * easing(p);
      target.scale.set(rest.x * s, rest.y * s);
    },
    onComplete: o.onComplete
  });
}

export function rollIn(target: PuaTarget, end?: PuaEnd<RollInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const rotation = takeRestRotation(target);
  const alpha = appear(target);
  const distance = o.distance ?? Math.max(80, visualSize(target).width * 1.5);
  const turns = (o.turns ?? 1) * Math.PI * 2;
  const duration = o.duration ?? 700;
  const easing = resolveEasing(o.easing, 'cubicOut');
  const side = o.direction === 'right' ? 1 : -1;

  fadeTo(target, alpha, duration * 0.5, o.delay, easings.quadOut);
  run({
    target,
    channel: 'rotation',
    duration,
    delay: o.delay,
    base: { rotation },
    onUpdate: (p) => {
      target.rotation = rotation + side * turns * (1 - easing(p));
    }
  });
  run({
    target,
    channel: 'position',
    duration,
    delay: o.delay,
    base: rest,
    onUpdate: (p) => {
      target.position.set(rest.x + side * distance * (1 - easing(p)), rest.y);
    },
    onComplete: o.onComplete
  });
}

export function flipIn(target: PuaTarget, end?: PuaEnd<FlipInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const alpha = appear(target);
  const axis = o.axis ?? 'x';
  const duration = o.duration ?? 600;
  const easing = resolveEasing(o.easing, 'backOut');

  fadeTo(target, alpha, duration * 0.4, o.delay, easings.quadOut);
  run({
    target,
    channel: 'scale',
    duration,
    delay: o.delay,
    base: rest,
    onUpdate: (p) => {
      const s = easing(p);
      if (axis === 'x') target.scale.set(rest.x * s, rest.y);
      else target.scale.set(rest.x, rest.y * s);
    },
    onComplete: o.onComplete
  });
}

export function swirl(target: PuaTarget, end?: PuaEnd<SwirlOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const rotation = takeRestRotation(target);
  const alpha = appear(target);
  const turns = (o.turns ?? 1) * Math.PI * 2;
  const duration = o.duration ?? 700;
  const easing = resolveEasing(o.easing, 'cubicOut');

  fadeTo(target, alpha, duration * 0.5, o.delay, easings.quadOut);
  run({
    target,
    channel: 'rotation',
    duration,
    delay: o.delay,
    base: { rotation },
    onUpdate: (p) => {
      target.rotation = rotation - turns * (1 - easing(p));
    }
  });
  run({
    target,
    channel: 'scale',
    duration,
    delay: o.delay,
    base: rest,
    onUpdate: (p) => {
      const s = easing(p);
      target.scale.set(rest.x * s, rest.y * s);
    },
    onComplete: o.onComplete
  });
}

export function jump(target: PuaTarget, end?: PuaEnd<JumpOptions>): void {
  const o = resolveEnd(end);
  const restPosition = takeRestPosition(target);
  const restScale = takeRestScale(target);
  const height = o.height ?? Math.max(24, visualSize(target).height * 0.6);
  const squash = o.squash ?? 0.2;
  const duration = o.duration ?? 700;

  run({
    target,
    channel: 'position',
    duration,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: restPosition,
    onUpdate: (p) => {
      const lift = p > 0.2 && p < 0.8 ? Math.sin(((p - 0.2) / 0.6) * Math.PI) : 0;
      target.position.set(restPosition.x, restPosition.y - height * lift);
    },
    onComplete: o.onComplete
  });

  run({
    target,
    channel: 'scale',
    duration,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: restScale,
    onUpdate: (p) => {
      let k = 0;
      if (p < 0.2) k = squash * Math.sin((p / 0.2) * Math.PI);
      else if (p < 0.8) k = -squash * 0.5 * Math.sin(((p - 0.2) / 0.6) * Math.PI);
      else k = squash * 0.6 * Math.sin(((p - 0.8) / 0.2) * Math.PI);
      target.scale.set(restScale.x * (1 + k), restScale.y * (1 - k));
    }
  });
}

export function impact(target: PuaTarget, end?: PuaEnd<ImpactOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const strength = o.strength ?? 0.3;
  const release = overshootOut(0.12);

  run({
    target,
    channel: 'scale',
    duration: o.duration ?? 350,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const k = p < 0.25 ? easings.quadOut(p / 0.25) : 1 - release((p - 0.25) / 0.75);
      target.scale.set(rest.x * (1 + strength * k), rest.y * (1 - strength * k));
    },
    onComplete: o.onComplete
  });
}

export function elasticIn(target: PuaTarget, end?: PuaEnd<ElasticInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  target.visible = true;
  const from = o.from ?? 0;
  target.scale.set(rest.x * from, rest.y * from);

  run({
    target,
    channel: 'scale',
    object: target.scale,
    to: rest,
    duration: o.duration ?? 900,
    easing: resolveEasing(o.easing, 'elasticOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function bounceIn(target: PuaTarget, end?: PuaEnd<BounceInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const alpha = appear(target);
  const duration = o.duration ?? 800;
  const from = o.from ?? 0;
  target.scale.set(rest.x * from, rest.y * from);

  fadeTo(target, alpha, duration * 0.3, o.delay, easings.quadOut);
  run({
    target,
    channel: 'scale',
    object: target.scale,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'bounceOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function popOut(target: PuaTarget, end?: PuaEnd<PopOutOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const overshoot = o.overshoot ?? 0.15;

  run({
    target,
    channel: 'scale',
    duration: o.duration ?? 350,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const s = p < 0.3 ? 1 + overshoot * easings.quadOut(p / 0.3) : (1 + overshoot) * (1 - easings.quadIn((p - 0.3) / 0.7));
      target.scale.set(rest.x * s, rest.y * s);
    },
    onComplete: () => {
      target.scale.set(0);
      target.visible = false;
      keepRestScale(target, rest);
      o.onComplete?.();
    }
  });
}

export function lightSpeedIn(target: PuaTarget, end?: PuaEnd<LightSpeedInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const alpha = appear(target);
  const distance = o.distance ?? Math.max(80, visualSize(target).width * 1.5);
  const skew = (o.skew ?? 30) * DEG_TO_RAD;
  const restSkew = target.skew.x;
  const duration = o.duration ?? 600;
  const easing = resolveEasing(o.easing, 'cubicOut');
  const side = o.direction === 'left' ? -1 : 1;

  fadeTo(target, alpha, duration * 0.6, o.delay, easings.quadOut);
  run({
    target,
    channel: 'skew',
    duration,
    delay: o.delay,
    base: { skew: restSkew },
    onUpdate: (p) => {
      target.skew.x = restSkew + side * skew * keyframe(LIGHT_SPEED_SKEW, p);
    },
    onComplete: () => {
      target.skew.x = restSkew;
    }
  });
  run({
    target,
    channel: 'position',
    duration,
    delay: o.delay,
    base: rest,
    onUpdate: (p) => {
      target.position.set(rest.x + side * distance * (1 - easing(p)), rest.y);
    },
    onComplete: o.onComplete
  });
}

export function vibrate(target: PuaTarget, end?: PuaEnd<VibrateOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestRotation(target);
  const angle = (o.angle ?? 3) * DEG_TO_RAD;
  const shakes = o.shakes ?? 12;

  run({
    target,
    channel: 'rotation',
    duration: o.duration ?? 400,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: { rotation: rest },
    onUpdate: (p) => {
      target.rotation = rest + Math.sin(p * Math.PI * shakes) * (1 - p) * angle;
    },
    onComplete: o.onComplete
  });
}

export function flicker(target: PuaTarget, end?: PuaEnd<FlickerOptions>): void {
  const o = resolveEnd(end);
  const alpha = takeRestAlpha(target);
  const intensity = o.intensity ?? 1;
  target.visible = true;

  run({
    target,
    channel: 'alpha',
    duration: o.duration ?? 800,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: { alpha },
    onUpdate: (p) => {
      const dip = 1 - FLICKER[Math.min(FLICKER.length - 1, Math.floor(p * FLICKER.length))];
      target.alpha = alpha * (1 - intensity * dip);
    },
    onComplete: () => {
      target.alpha = alpha;
      o.onComplete?.();
    }
  });
}

export function blink(target: PuaTarget, options: BlinkOptions = {}): void {
  const alpha = takeRestAlpha(target);
  const low = options.alpha ?? 0;
  target.visible = true;

  run({
    target,
    channel: 'alpha',
    duration: (options.interval ?? 500) * 2,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      target.alpha = p < 0.5 ? alpha : alpha * low;
    }
  });
}

export function breathe(target: PuaTarget, options: BreatheOptions = {}): void {
  const restScale = takeRestScale(target);
  const alpha = takeRestAlpha(target);
  const strength = options.strength ?? 0.05;
  const dim = alpha * (1 - (options.alpha ?? 0.7));
  const duration = options.duration ?? 2400;

  run({
    target,
    channel: 'scale',
    duration,
    delay: options.delay,
    loop: true,
    base: restScale,
    onUpdate: (p) => {
      const s = 1 + strength * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
      target.scale.set(restScale.x * s, restScale.y * s);
    }
  });

  run({
    target,
    channel: 'alpha',
    duration,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      target.alpha = alpha - dim * (0.5 + 0.5 * Math.cos(p * Math.PI * 2));
    }
  });
}

export function sway(target: PuaTarget, options: SwayOptions = {}): void {
  const rest = takeRestRotation(target);
  const angle = (options.angle ?? 6) * DEG_TO_RAD;

  run({
    target,
    channel: 'rotation',
    duration: options.duration ?? 2000,
    delay: options.delay,
    loop: true,
    base: { rotation: rest },
    onUpdate: (p) => {
      target.rotation = rest + Math.sin(p * Math.PI * 2) * angle;
    }
  });
}

export function jitter(target: PuaTarget, options: JitterOptions = {}): void {
  const rest = takeRestPosition(target);
  const amplitude = options.amplitude ?? 2;
  const interval = options.interval ?? 0;
  let last = 2;

  run({
    target,
    channel: 'position',
    duration: interval > 0 ? interval : 1000,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const cycled = p < last;
      last = p;
      if (interval > 0 && !cycled) return;
      target.position.set(rest.x + (Math.random() - 0.5) * 2 * amplitude, rest.y + (Math.random() - 0.5) * 2 * amplitude);
    }
  });
}

function appear(target: PuaTarget): number {
  const alpha = takeRestAlpha(target);
  if (!find(target, 'alpha')) target.alpha = 0;
  target.visible = true;
  return alpha;
}

function fadeTo(
  target: PuaTarget,
  alpha: number,
  duration: number,
  delay: number | undefined,
  easing: EasingFn,
  onComplete?: PuaCallback
): void {
  run({
    target,
    channel: 'alpha',
    object: target,
    to: { alpha },
    duration,
    easing,
    delay,
    base: { alpha },
    onComplete
  });
}

function fadeAway(target: PuaTarget, duration: number, delay: number | undefined): void {
  const alpha = takeRestAlpha(target);
  run({
    target,
    channel: 'alpha',
    object: target,
    to: { alpha: 0 },
    duration,
    easing: easings.quadIn,
    delay,
    base: { alpha },
    onComplete: () => keepRestAlpha(target, alpha)
  });
}

function slideDistance(target: PuaTarget, direction: SlideDirection): number {
  const size = visualSize(target);
  return Math.max(60, (DIRECTIONS[direction].x !== 0 ? size.width : size.height) * 1.2);
}

// Piecewise interpolation between [time, value] keyframes with a smooth ease on every segment.
function keyframe(frames: [number, number][], p: number): number {
  for (let i = 1; i < frames.length; i++) {
    const [t0, v0] = frames[i - 1];
    const [t1, v1] = frames[i];
    if (p <= t1) {
      const u = t1 === t0 ? 1 : (p - t0) / (t1 - t0);
      return v0 + (v1 - v0) * easings.sineInOut(u);
    }
  }
  return frames[frames.length - 1][1];
}

export interface FadeOptions extends PuaOptions {
  duration?: number;
}

export interface SlideOptions extends PuaOptions {
  duration?: number;
  distance?: number;
}

export interface ZoomInOptions extends PuaOptions {
  duration?: number;
  from?: number;
}

export interface ZoomOutOptions extends PuaOptions {
  duration?: number;
  to?: number;
}

export interface FlipOutOptions extends PuaOptions {
  duration?: number;
  axis?: 'x' | 'y';
}

export interface RollOutOptions extends PuaOptions {
  duration?: number;
  distance?: number;
  turns?: number;
  direction?: 'left' | 'right';
}

export interface SpringOutOptions extends PuaOptions {
  duration?: number;
  strength?: number;
}

export interface FallOutOptions extends PuaOptions {
  duration?: number;
  distance?: number;
  angle?: number;
}

export interface PunchUpOptions extends PuaOptions {
  duration?: number;
  strength?: number;
}

export interface CoinFlipOptions extends PuaOptions {
  duration?: number;
  flips?: number;
  height?: number;
}

export interface NodOptions extends PuaOptions {
  duration?: number;
  amplitude?: number;
  nods?: number;
}

export interface SpinLoopOptions {
  duration?: number;
  clockwise?: boolean;
  delay?: number;
}

export interface OrbitOptions {
  duration?: number;
  radius?: number;
  clockwise?: boolean;
  delay?: number;
}

export interface PingOptions {
  duration?: number;
  scale?: number;
  delay?: number;
}

const punchSettle = overshootOut(0.15);

export function fadeIn(target: PuaTarget, end?: PuaEnd<FadeOptions>): void {
  const o = resolveEnd(end);
  const alpha = appear(target);
  fadeTo(target, alpha, o.duration ?? 300, o.delay, resolveEasing(o.easing, 'quadOut'), o.onComplete);
}

export function fadeOut(target: PuaTarget, end?: PuaEnd<FadeOptions>): void {
  const o = resolveEnd(end);
  const alpha = takeRestAlpha(target);

  run({
    target,
    channel: 'alpha',
    object: target,
    to: { alpha: 0 },
    duration: o.duration ?? 300,
    easing: resolveEasing(o.easing, 'quadIn'),
    delay: o.delay,
    base: { alpha },
    onComplete: () => {
      target.visible = false;
      keepRestAlpha(target, alpha);
      o.onComplete?.();
    }
  });
}

export function slideIn(target: PuaTarget, direction: SlideDirection, end?: PuaEnd<SlideOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const alpha = appear(target);
  const dir = DIRECTIONS[direction];
  const distance = o.distance ?? slideDistance(target, direction);
  const duration = o.duration ?? 450;
  target.position.set(rest.x + dir.x * distance, rest.y + dir.y * distance);

  fadeTo(target, alpha, duration * 0.6, o.delay, easings.quadOut);
  run({
    target,
    channel: 'position',
    object: target.position,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'cubicOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function slideOut(target: PuaTarget, direction: SlideDirection, end?: PuaEnd<SlideOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const dir = DIRECTIONS[direction];
  const distance = o.distance ?? slideDistance(target, direction);
  const duration = o.duration ?? 400;

  fadeAway(target, duration, o.delay);
  run({
    target,
    channel: 'position',
    object: target.position,
    to: { x: rest.x + dir.x * distance, y: rest.y + dir.y * distance },
    duration,
    easing: resolveEasing(o.easing, 'cubicIn'),
    delay: o.delay,
    base: rest,
    onComplete: () => {
      target.visible = false;
      keepRestPosition(target, rest);
      o.onComplete?.();
    }
  });
}

export function zoomIn(target: PuaTarget, end?: PuaEnd<ZoomInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const alpha = appear(target);
  const from = o.from ?? 0.3;
  const duration = o.duration ?? 400;
  target.scale.set(rest.x * from, rest.y * from);

  fadeTo(target, alpha, duration * 0.6, o.delay, easings.quadOut);
  run({
    target,
    channel: 'scale',
    object: target.scale,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'cubicOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function zoomOut(target: PuaTarget, end?: PuaEnd<ZoomOutOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const to = o.to ?? 1.8;
  const duration = o.duration ?? 350;

  fadeAway(target, duration, o.delay);
  run({
    target,
    channel: 'scale',
    object: target.scale,
    to: { x: rest.x * to, y: rest.y * to },
    duration,
    easing: resolveEasing(o.easing, 'cubicIn'),
    delay: o.delay,
    base: rest,
    onComplete: () => {
      target.visible = false;
      keepRestScale(target, rest);
      o.onComplete?.();
    }
  });
}

export function flipOut(target: PuaTarget, end?: PuaEnd<FlipOutOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const axis = o.axis ?? 'x';
  const duration = o.duration ?? 400;
  const easing = resolveEasing(o.easing, 'backIn');

  fadeAway(target, duration, o.delay);
  run({
    target,
    channel: 'scale',
    duration,
    delay: o.delay,
    base: rest,
    onUpdate: (p) => {
      const s = 1 - easing(p);
      if (axis === 'x') target.scale.set(rest.x * s, rest.y);
      else target.scale.set(rest.x, rest.y * s);
    },
    onComplete: () => {
      target.visible = false;
      keepRestScale(target, rest);
      o.onComplete?.();
    }
  });
}

export function rollOut(target: PuaTarget, end?: PuaEnd<RollOutOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const rotation = takeRestRotation(target);
  const distance = o.distance ?? Math.max(80, visualSize(target).width * 1.5);
  const turns = (o.turns ?? 1) * Math.PI * 2;
  const duration = o.duration ?? 600;
  const easing = resolveEasing(o.easing, 'cubicIn');
  const side = o.direction === 'left' ? -1 : 1;

  fadeAway(target, duration, o.delay);
  run({
    target,
    channel: 'rotation',
    duration,
    delay: o.delay,
    base: { rotation },
    onUpdate: (p) => {
      target.rotation = rotation + side * turns * easing(p);
    },
    onComplete: () => {
      target.rotation = rotation;
    }
  });
  run({
    target,
    channel: 'position',
    duration,
    delay: o.delay,
    base: rest,
    onUpdate: (p) => {
      target.position.set(rest.x + side * distance * easing(p), rest.y);
    },
    onComplete: () => {
      target.visible = false;
      keepRestPosition(target, rest);
      o.onComplete?.();
    }
  });
}

export function springOut(target: PuaTarget, end?: PuaEnd<SpringOutOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const strength = o.strength ?? 1;
  const frames: [number, number][] = [
    [0, 1],
    [0.2, 1 - 0.1 * strength],
    [0.55, 1 + 0.12 * strength],
    [1, 0]
  ];

  run({
    target,
    channel: 'scale',
    duration: o.duration ?? 500,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const s = keyframe(frames, p);
      target.scale.set(rest.x * s, rest.y * s);
    },
    onComplete: () => {
      target.scale.set(0);
      target.visible = false;
      keepRestScale(target, rest);
      o.onComplete?.();
    }
  });
}

export function fallOut(target: PuaTarget, end?: PuaEnd<FallOutOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const rotation = takeRestRotation(target);
  const distance = o.distance ?? Math.max(80, visualSize(target).height * 1.5);
  const angle = (o.angle ?? 20) * DEG_TO_RAD;
  const duration = o.duration ?? 600;
  const easing = resolveEasing(o.easing, 'quadIn');

  fadeAway(target, duration, o.delay);
  run({
    target,
    channel: 'rotation',
    duration,
    delay: o.delay,
    base: { rotation },
    onUpdate: (p) => {
      target.rotation = rotation + angle * easings.quadOut(p);
    },
    onComplete: () => {
      target.rotation = rotation;
    }
  });
  run({
    target,
    channel: 'position',
    duration,
    delay: o.delay,
    base: rest,
    onUpdate: (p) => {
      target.position.set(rest.x, rest.y + distance * easing(p));
    },
    onComplete: () => {
      target.visible = false;
      keepRestPosition(target, rest);
      o.onComplete?.();
    }
  });
}

export function punchUp(target: PuaTarget, end?: PuaEnd<PunchUpOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(target);
  const strength = o.strength ?? 0.25;

  run({
    target,
    channel: 'scale',
    duration: o.duration ?? 320,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const k = p < 0.3 ? easings.quadOut(p / 0.3) : 1 - punchSettle((p - 0.3) / 0.7);
      target.scale.set(rest.x * (1 + strength * k), rest.y * (1 + strength * k));
    },
    onComplete: o.onComplete
  });
}

export function coinFlip(target: PuaTarget, end?: PuaEnd<CoinFlipOptions>): void {
  const o = resolveEnd(end);
  const restScale = takeRestScale(target);
  const restPosition = takeRestPosition(target);
  const flips = Math.max(1, Math.round(o.flips ?? 2));
  const height = o.height ?? Math.max(24, visualSize(target).height * 0.5);
  const duration = o.duration ?? 800;

  run({
    target,
    channel: 'position',
    duration,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: restPosition,
    onUpdate: (p) => {
      target.position.set(restPosition.x, restPosition.y - height * Math.sin(p * Math.PI));
    }
  });
  run({
    target,
    channel: 'scale',
    duration,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: restScale,
    onUpdate: (p) => {
      target.scale.set(restScale.x * Math.cos(easings.sineInOut(p) * Math.PI * 2 * flips), restScale.y);
    },
    onComplete: o.onComplete
  });
}

export function nod(target: PuaTarget, end?: PuaEnd<NodOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(target);
  const amplitude = o.amplitude ?? Math.min(16, Math.max(5, visualSize(target).height * 0.08));
  const nods = o.nods ?? 2;

  run({
    target,
    channel: 'position',
    duration: o.duration ?? 450,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      target.position.set(rest.x, rest.y + Math.sin(p * Math.PI * 2 * nods) * (1 - p) * amplitude);
    },
    onComplete: o.onComplete
  });
}

export function spinLoop(target: PuaTarget, options: SpinLoopOptions = {}): void {
  const rest = takeRestRotation(target);
  const sign = options.clockwise === false ? -1 : 1;

  run({
    target,
    channel: 'rotation',
    duration: options.duration ?? 1200,
    delay: options.delay,
    loop: true,
    base: { rotation: rest },
    onUpdate: (p) => {
      target.rotation = rest + sign * p * Math.PI * 2;
    }
  });
}

// The circle passes through the rest position, so the loop starts without a jump.
export function orbit(target: PuaTarget, options: OrbitOptions = {}): void {
  const rest = takeRestPosition(target);
  const radius = options.radius ?? 8;
  const sign = options.clockwise === false ? -1 : 1;

  run({
    target,
    channel: 'position',
    duration: options.duration ?? 1800,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const a = sign * p * Math.PI * 2;
      target.position.set(rest.x + Math.sin(a) * radius, rest.y + (1 - Math.cos(a)) * radius);
    }
  });
}

export function ping(target: PuaTarget, options: PingOptions = {}): void {
  const rest = takeRestScale(target);
  const alpha = takeRestAlpha(target);
  const scale = options.scale ?? 1.6;
  const duration = options.duration ?? 1200;
  target.visible = true;

  run({
    target,
    channel: 'scale',
    duration,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const s = 1 + (scale - 1) * easings.quadOut(p);
      target.scale.set(rest.x * s, rest.y * s);
    }
  });
  run({
    target,
    channel: 'alpha',
    duration,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      target.alpha = alpha * (1 - easings.quadIn(p));
    }
  });
}
